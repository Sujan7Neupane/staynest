import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "../../../../../../prisma/client";

type RouteParams = {
  params: Promise<{ id: string; imageId: string }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can remove images" },
      { status: 403 },
    );
  }

  try {
    const { id, imageId } = await params;

    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId: id,
        property: { hostId: session.user.id },
      },
    });

    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    await prisma.propertyImage.delete({ where: { id: imageId } });

    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error(error);
    }

    return NextResponse.json({ message: "Image removed successfully" });
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
      { message: "Only hosts can update images" },
      { status: 403 },
    );
  }

  try {
    const { id, imageId } = await params;
    const body = await request.json();

    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId: id,
        property: { hostId: session.user.id },
      },
    });

    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const data: { altText?: string | null; position?: number } = {};

    if ("altText" in body) {
      const altText = body.altText;

      if (
        altText !== null &&
        (typeof altText !== "string" || altText.length > 250)
      ) {
        return NextResponse.json(
          { message: "Invalid alt text" },
          { status: 400 },
        );
      }

      data.altText = altText;
    }

    if ("position" in body) {
      const position = body.position;

      if (!Number.isInteger(position) || position < 0) {
        return NextResponse.json(
          { message: "Position must be a non-negative integer" },
          { status: 400 },
        );
      }

      const positionTaken = await prisma.propertyImage.findFirst({
        where: { propertyId: id, position, NOT: { id: imageId } },
      });

      if (positionTaken) {
        return NextResponse.json(
          { message: "Another image already uses this position" },
          { status: 400 },
        );
      }

      data.position = position;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Provide altText or position to update" },
        { status: 400 },
      );
    }

    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data,
    });

    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
