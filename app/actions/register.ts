"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { registerSchema } from "../../lib/zodValidations/auth";
import prisma from "../../prisma/client";

export type RegisterState = {
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };
  message?: string;
  values?: {
    name: string;
    email: string;
    role: "GUEST" | "HOST";
  };
};

export async function registerUser(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validation = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validation.success) {
    const errors: Record<string, string> = {};

    for (const issue of validation.error.issues) {
      const field = issue.path[0];

      if (field) {
        errors[field.toString()] = issue.message;
      }
    }

    return {
      errors,
      values: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        role: formData.get("role") === "HOST" ? "HOST" : "GUEST",
      },
    };
  }

  const { name, email, password, role } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        message: "Email is already registered.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return {
      message: "Something went wrong. Please try again.",
    };
  }

  redirect("/login");
}
