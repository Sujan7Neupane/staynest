import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { reviewSchema } from "../../../lib/zodValidations/reviews";

export async function POST(request: NextRequest) {
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
        { message: "Only guests can submit reviews" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid review data", errors: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { bookingId, rating, comment } = validation.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    if (!booking || booking.guestId !== session.user.id) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { message: "You can only review completed bookings" },
        { status: 400 },
      );
    }

    if (booking.property.hostId === session.user.id) {
      return NextResponse.json(
        { message: "You cannot review your own property" },
        { status: 403 },
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this booking" },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        guestId: session.user.id,
        propertyId: booking.propertyId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create review error:", error);

    return NextResponse.json(
      { message: "Something went wrong while submitting the review" },
      { status: 500 },
    );
  }
}
