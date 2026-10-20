import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../../prisma/client";
import { cancelBookingSchema } from "../../../../lib/zodValidations/booking";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        room: true,
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const isGuest = booking.guestId === session.user.id;
    const isHost = booking.property.hostId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isGuest && !isHost && !isAdmin) {
      return NextResponse.json(
        { message: "You are not allowed to view this booking" },
        { status: 403 },
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "GUEST") {
    return NextResponse.json(
      { message: "Only guests can cancel bookings" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    // console.log(body);

    const validation = cancelBookingSchema.safeParse(body);
    // console.log(validation);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id, guestId: session.user.id },
      include: { property: true },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { message: "This booking cannot be cancelled" },
        { status: 400 },
      );
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const deadline =
      booking.checkIn.getTime() -
      booking.property.cancellationDeadlineDays * oneDay;

    if (Date.now() > deadline) {
      return NextResponse.json(
        { message: "The cancellation deadline has passed" },
        { status: 400 },
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: validation.data.status },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
