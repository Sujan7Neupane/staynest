import Link from "next/link";
import { auth } from "@/auth";
import HeaderAccount from "./client/HeaderAccount";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          StayNest<span className="text-blue-600">.</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/bookings"
            className="hidden text-gray-600 hover:text-black sm:block"
          >
            My Bookings
          </Link>

          {/* <Link
            href="/dashboard/host"
            className="hidden text-gray-600 hover:text-black sm:block"
          >
            Become a Host
          </Link> */}

          <HeaderAccount userLabel={session?.user.name} />
        </div>
      </nav>
    </header>
  );
}
