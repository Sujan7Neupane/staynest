import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { propertySchema } from "../../../../lib/zodValidations/property";
import prisma from "../../../../prisma/client";
import cloudinary from "../../../../lib/cloudinary";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: {
          orderBy: { roomNumber: "asc" },
        },
      },
    });

    if (!property || property.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    let unavailableRoomIds: string[] = [];
    let propertyUnavailable = false;

    if (checkIn && checkOut) {
      const startDate = new Date(`${checkIn}T00:00:00.000Z`);
      const endDate = new Date(`${checkOut}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate <= startDate ||
        startDate.toISOString().slice(0, 10) !== checkIn ||
        endDate.toISOString().slice(0, 10) !== checkOut
      ) {
        return NextResponse.json(
          { message: "Invalid booking dates" },
          { status: 400 },
        );
      }

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          propertyId: id,
          roomId: {
            in: property.rooms.map((room) => room.id),
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          checkIn: { lt: endDate },
          checkOut: { gt: startDate },
        },
        select: {
          id: true,
          roomId: true,
          status: true,
          checkIn: true,
          checkOut: true,
          holdExpiresAt: true,
        },
      });

      // console.log("Matching bookings:", overlappingBookings);

      if (property.type === "HOTEL") {
        unavailableRoomIds = overlappingBookings
          .map((booking) => booking.roomId)
          .filter((roomId): roomId is string => roomId !== null);
      } else {
        propertyUnavailable = overlappingBookings.length > 0;
      }
    }

    return NextResponse.json({
      property,
      unavailableRoomIds,
      propertyUnavailable,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can update properties" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const validation = propertySchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid property data" },
        { status: 400 },
      );
    }

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        { message: "Please provide something to update" },
        { status: 400 },
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: session.user.id,
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ property: updatedProperty });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can delete properties" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;

    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: session.user.id,
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    await prisma.property.delete({
      where: { id },
    });

    if (property.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(property.imagePublicId);
      } catch (error) {
        console.error("Failed to delete Cloudinary image:", error);
      }
    }

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
