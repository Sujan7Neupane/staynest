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

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
      },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ property });
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
      where: { id, hostId: session.user.id },
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
      where: { id, hostId: session.user.id },
      include: { images: true },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    await prisma.property.delete({ where: { id } });

    for (const image of property.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error(error);
      }
    }

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
