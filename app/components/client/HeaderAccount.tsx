"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

type HeaderAccountProps = {
  userLabel: string | null;
};

export default function HeaderAccount({ userLabel }: HeaderAccountProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!userLabel) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
      >
        <span>{userLabel}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
