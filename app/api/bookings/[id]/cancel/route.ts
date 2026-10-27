import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 },
      );
    }

    if (session.user.role !== "GUEST") {
      return NextResponse.json(
        { error: "Only guests can cancel bookings." },
        { status: 403 },
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (booking.guestId !== session.user.id) {
      return NextResponse.json(
        { error: "You cannot cancel this booking." },
        { status: 403 },
      );
    }

    if (booking.status !== "PENDING" || booking.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Only unpaid pending bookings can be cancelled." },
        { status: 400 },
      );
    }

    const result = await prisma.booking.updateMany({
      where: {
        id: booking.id,
        guestId: session.user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "This booking can no longer be cancelled." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { error: "Something went wrong while cancelling the booking." },
      { status: 500 },
    );
  }
}
