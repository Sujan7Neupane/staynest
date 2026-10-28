import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log(id);

    const reviews = await prisma.review.findMany({
      where: { propertyId: id },
      include: {
        guest: {
          select: {
            name: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // console.log(reviews);

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          totalReviews
        : 0;

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
