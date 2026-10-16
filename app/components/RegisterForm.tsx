"use client";

import { useActionState } from "react";
import Link from "next/link";
import { RegisterState, registerUser } from "../actions/register";
import FormInput from "./ui/FormInput";
import PasswordInput from "./ui/PasswordInput";
import Button from "./ui/Button";

const initialState: RegisterState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join StayNest and find your next stay.
          </p>
        </div>

        <form action={formAction} noValidate className="space-y-5">
          <div>
            <FormInput
              label="Full Name"
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
              defaultValue={state.values?.name ?? ""}
            />
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
            )}
          </div>

          <div>
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
              defaultValue={state.values?.email ?? ""}
            />
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
            )}
          </div>

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Account type
            </label>

            <select
              id="role"
              name="role"
              defaultValue={state.values?.role ?? "GUEST"}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            >
              <option value="GUEST">Guest — Find a place to stay</option>
              <option value="HOST">Host — List your property</option>
            </select>

            {state.errors?.role && (
              <p className="mt-1 text-sm text-red-600">{state.errors.role}</p>
            )}
          </div>

          {state.message && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        By creating an account, you agree to use StayNest responsibly.
      </p>
    </div>
  );
}
