"use server";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginUser(
  prevState: { error?: string },
  formData: FormData,
) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password.",
      };
    }

    throw error;
  }

  redirect("/");
}
