import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import cloudinary from "../../../lib/cloudinary";
import cloudinaryUpload from "../../../lib/cloudinaryUpload";

type ProfileUpdateData = {
  name?: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const image = formData.get("image");

    const data: ProfileUpdateData = {};

    if (typeof name === "string") {
      if (!name.trim()) {
        return NextResponse.json(
          { message: "Name cannot be empty" },
          { status: 400 },
        );
      }
      data.name = name.trim();
    }

    let oldImagePublicId: string | null = null;

    if (image instanceof File && image.size > 0) {
      try {
        const result = await cloudinaryUpload(image, "staynest/profiles");
        data.profileImageUrl = result.secure_url;
        data.profileImagePublicId = result.public_id;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to upload image";
        return NextResponse.json({ message }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { profileImagePublicId: true },
      });
      oldImagePublicId = user?.profileImagePublicId ?? null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImageUrl: true,
      },
    });

    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
