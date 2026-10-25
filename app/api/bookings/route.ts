import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../prisma/client";
import { bookingSchema } from "../../../lib/zodValidations/booking";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  try {
    let where = {};

    if (session.user.role === "GUEST") {
      where = {
        guestId: session.user.id,
      };
    } else if (session.user.role === "HOST") {
      where = {
        property: {
          hostId: session.user.id,
        },
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            imageUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            name: true,
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Fetching bookings error:", error);

    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  if (session.user.role !== "GUEST") {
    return NextResponse.json(
      { message: "Only guests can create bookings" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid booking details",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { propertyId, roomId, checkIn, checkOut, guests } = result.data;

    const startDate = new Date(`${checkIn}T00:00:00.000Z`);
    const endDate = new Date(`${checkOut}T00:00:00.000Z`);

    const nights =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Property not found or unavailable" },
        { status: 404 },
      );
    }

    let pricePerNight = property.pricePerNight;
    let selectedRoomId: string | null = null;
    let maxGuests = property.maxGuests;

    if (property.type === "HOTEL") {
      if (!roomId) {
        return NextResponse.json(
          { message: "Please select a room" },
          { status: 400 },
        );
      }

      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
          propertyId,
          status: "AVAILABLE",
        },
      });

      if (!room) {
        return NextResponse.json(
          { message: "Room not found or unavailable" },
          { status: 404 },
        );
      }

      pricePerNight = room.pricePerNight;
      maxGuests = room.maxGuests;
      selectedRoomId = room.id;
    } else if (roomId) {
      return NextResponse.json(
        { message: "Vacation rentals do not require a room selection" },
        { status: 400 },
      );
    }

    if (guests > maxGuests) {
      return NextResponse.json(
        { message: `Maximum guests allowed: ${maxGuests}` },
        { status: 400 },
      );
    }

    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        roomId: selectedRoomId,
        OR: [
          {
            status: "CONFIRMED",
          },
          {
            status: "PENDING",
            holdExpiresAt: {
              gt: new Date(),
            },
          },
        ],
        checkIn: {
          lt: endDate,
        },
        checkOut: {
          gt: startDate,
        },
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { message: "This property or room is already booked for these dates" },
        { status: 409 },
      );
    }

    const totalPrice = pricePerNight.mul(nights);

    const booking = await prisma.booking.create({
      data: {
        checkIn: startDate,
        checkOut: endDate,
        guests,
        pricePerNight,
        totalPrice,
        status: "PENDING",
        holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        paymentStatus: "PENDING",
        guestId: session.user.id,
        propertyId,
        roomId: selectedRoomId,
      },
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking creation error:", error);

    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 },
    );
  }
}
