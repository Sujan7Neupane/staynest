import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../../../prisma/client";
import cloudinaryUpload from "../../../../../lib/cloudinaryUpload";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can add images" },
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

    if (property.images.length >= 3) {
      return NextResponse.json(
        { message: "A property can have a maximum of 3 images" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { message: "Please select an image" },
        { status: 400 },
      );
    }

    const uploadResult = await cloudinaryUpload(image);

    const lastPosition = Math.max(
      -1,
      ...property.images.map((img) => img.position),
    );

    const savedImage = await prisma.propertyImage.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        position: lastPosition + 1,
        propertyId: id,
      },
    });

    return NextResponse.json({ image: savedImage }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
