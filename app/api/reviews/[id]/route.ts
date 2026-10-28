import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please log in first" },
        { status: 401 },
      );
    }

    if (session.user.role !== "GUEST") {
      return NextResponse.json(
        { message: "Only guests can update reviews" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.guestId !== session.user.id) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be an integer between 1 and 5" },
        { status: 400 },
      );
    }

    if (
      comment !== undefined &&
      comment !== null &&
      (typeof comment !== "string" || comment.length > 1000)
    ) {
      return NextResponse.json(
        { message: "Comment must be text with at most 1000 characters" },
        { status: 400 },
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment: typeof comment === "string" ? comment.trim() || null : null,
      },
    });

    return NextResponse.json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return NextResponse.json(
      { message: "Failed to update review" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please log in first" },
        { status: 401 },
      );
    }

    if (session.user.role !== "GUEST") {
      return NextResponse.json(
        { message: "Only guests can delete reviews" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.guestId !== session.user.id) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return NextResponse.json(
      { message: "Failed to delete review" },
      { status: 500 },
    );
  }
}
