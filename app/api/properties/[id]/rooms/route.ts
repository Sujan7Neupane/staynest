import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../../../prisma/client";
import { roomSchema } from "../../../../../lib/zodValidations/room";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: propertyId } = await params;
    // console.log(propertyId);

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        type: "HOTEL",
        status: "PUBLISHED",
      },
    });

    // console.log(property);

    if (!property) {
      return NextResponse.json(
        { message: "Hotel not found or unavailable" },
        { status: 404 },
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        propertyId,
        status: "AVAILABLE",
      },
      select: {
        id: true,
        roomNumber: true,
        name: true,
        description: true,
        pricePerNight: true,
        maxGuests: true,
      },
      orderBy: {
        roomNumber: "asc",
      },
    });

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error("Fetching rooms error:", error);

    return NextResponse.json(
      { message: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

export async function POST(
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

  if (session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can add rooms" },
      { status: 403 },
    );
  }

  try {
    const { id: propertyId } = await params;
    // console.log(propertyId);

    const body = await request.json();

    const result = roomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid room details",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { roomNumber, name, description, pricePerNight, maxGuests } =
      result.data;

    //   console.log(roomNumber);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    // console.log(property);

    if (!property || property.type !== "HOTEL") {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    if (property.hostId !== session.user.id) {
      return NextResponse.json(
        { message: "You cannot add rooms to another host's hotel" },
        { status: 403 },
      );
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        name,
        description: description?.trim() || null,
        pricePerNight,
        maxGuests,
        propertyId,
      },
    });

    return NextResponse.json(
      {
        message: "Room created successfully",
        room,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Room creation error:", error);

    return NextResponse.json(
      { message: "Failed to create room" },
      { status: 500 },
    );
  }
}
