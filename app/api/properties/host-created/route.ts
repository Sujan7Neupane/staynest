import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "../../../../prisma/client";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "Please log in first" },
      { status: 401 },
    );
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json(
      { message: "Only hosts can view their properties" },
      { status: 403 },
    );
  }

  try {
    const properties = await prisma.property.findMany({
      where: {
        hostId: session.user.id,
      },
      omit: {
        hostId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (properties.length === 0) {
      return NextResponse.json(
        { message: "Properties not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Fetch host properties error:", error);

    return NextResponse.json(
      { message: "Failed to fetch your properties" },
      { status: 500 },
    );
  }
}
