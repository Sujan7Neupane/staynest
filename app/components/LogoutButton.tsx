"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <Button
        className="rounded bg-red-600 px-4 py-2 text-white"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Logout
      </Button>
    );
  }

  return (
    <Button
      className="rounded bg-blue-600 px-4 py-2 text-white"
      onClick={() => router.push("/login")}
    >
      Login
    </Button>
  );
}
