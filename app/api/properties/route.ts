import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { propertySchema } from "../../../lib/zodValidations/property";
import cloudinaryUpload from "../../../lib/cloudinaryUpload";
import prisma from "../../../prisma/client";

export async function POST(request: Request) {
  const session = await auth();
  //   console.log(session);

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can create properties" },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    // console.log(formData);

    const propertyData = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      address: formData.get("address"),
      city: formData.get("city"),
      country: formData.get("country"),
      pricePerNight: formData.get("pricePerNight"),
      maxGuests: formData.get("maxGuests"),
      bedrooms: formData.get("bedrooms"),
      bathrooms: formData.get("bathrooms"),
    };

    const result = propertySchema.safeParse(propertyData);
    // console.log(result);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const existingProperty = await prisma.property.findFirst({
      where: {
        hostId: session.user.id,
        title: result.data.title,
        description: result.data.description,
      },
    });

    if (existingProperty) {
      return NextResponse.json(
        { message: "Property already exists" },
        { status: 409 },
      );
    }

    // Get one image instead of an array of images
    const image = formData.get("image");

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (image !== null && !(image instanceof File)) {
      return NextResponse.json({ message: "Invalid image" }, { status: 400 });
    }

    if (image instanceof File && image.size > 0) {
      const uploadedImage = await cloudinaryUpload(image);

      imageUrl = uploadedImage.secure_url;
      imagePublicId = uploadedImage.public_id;
    }

    const property = await prisma.property.create({
      data: {
        ...result.data,
        hostId: session.user.id,
        imageUrl,
        imagePublicId,
      },
      omit: {
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 },
    );
  } catch (error) {
    console.error("Property creation error:", error);

    return NextResponse.json(
      { message: "Failed to create property" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const type = searchParams.get("type");

  if (type && type !== "HOTEL" && type !== "VACATION_RENTAL") {
    return NextResponse.json(
      { message: "Invalid property type" },
      { status: 400 },
    );
  }

  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "PUBLISHED",
        city: city ? { equals: city, mode: "insensitive" } : undefined,
        type: type ? (type as "HOTEL" | "VACATION_RENTAL") : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
