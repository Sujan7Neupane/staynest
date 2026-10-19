import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../../../../prisma/client";
import { updateRoomSchema } from "../../../../../../lib/zodValidations/room";

type RouteParams = {
  params: Promise<{
    id: string;
    roomId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can update rooms" },
      { status: 403 },
    );
  }

  try {
    const { id: propertyId, roomId } = await params;
    const body = await request.json();
    // console.log(body);

    const result = updateRoomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid room details",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    console.log(property);

    if (!property || property.type !== "HOTEL") {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    if (property.hostId !== session.user.id) {
      return NextResponse.json(
        { message: "You cannot manage rooms in another host's hotel" },
        { status: 403 },
      );
    }

    const existingRoom = await prisma.room.findFirst({
      where: {
        id: roomId,
        propertyId,
      },
    });

    // console.log(existingRoom);

    if (!existingRoom) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const room = await prisma.room.update({
      where: { id: roomId },
      data: result.data,
    });

    return NextResponse.json(
      { message: "Room updated successfully", room },
      { status: 200 },
    );
  } catch (error) {
    console.error("Room update error:", error);

    return NextResponse.json(
      { message: "Failed to update room" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can delete rooms" },
      { status: 403 },
    );
  }

  try {
    const { id: propertyId, roomId } = await params;

    // console.log(propertyId);
    // console.log(roomId);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    // console.log(property);

    if (!property || property.type !== "HOTEL") {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    // console.log(session.user.id);

    if (property.hostId !== session.user.id) {
      return NextResponse.json(
        { message: "You cannot manage rooms in another host's hotel" },
        { status: 403 },
      );
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        propertyId,
      },
    });
    // console.log(room);

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: { roomId },
      select: { id: true },
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "Cannot delete a room that has bookings" },
        { status: 409 },
      );
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Room deletion error:", error);

    return NextResponse.json(
      { message: "Failed to delete room" },
      { status: 500 },
    );
  }
}
