"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "../actions/login";
import FormInput from "./ui/FormInput";
import PasswordInput from "./ui/PasswordInput";
import Button from "./ui/Button";

const initialState = {
  error: "",
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginUser, initialState);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to StayNest.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Logging in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-black underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
