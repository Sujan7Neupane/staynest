import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "../../../../lib/zodValidations/auth";
import prisma from "../../../../prisma/client";
import z from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      //   console.log(validation.error);

      const errors = validation.error.issues.map((issue) => ({
        field: issue.path[0] ?? "general",
        message: issue.message,
      }));
      return NextResponse.json(
        {
          message: "Invalid registration data",
          errors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, role } = validation.data;
    if (!name || !email || !password)
      return NextResponse.json(
        { message: "These fields are required." },
        { status: 400 },
      );

    if (!role)
      return NextResponse.json(
        { message: "The role is invalid." },
        { status: 400 },
      );

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    console.log(user);

    return NextResponse.json(
      {
        message: "Registration successful",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Something went wrong during registration" },
      { status: 500 },
    );
  }
}
