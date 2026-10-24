import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              StayNest<span className="text-blue-600">.</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
              Discover comfortable stays, explore new places, and find the
              perfect place for your next trip.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Explore</h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Vacation Rentals
                </Link>
              </li>
              <li>
                <Link href="/dashboard/guest" className="hover:text-blue-600">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/host" className="hover:text-blue-600">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Support</h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Legal</h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StayNest. All rights reserved.</p>

          <p>Find your perfect stay.</p>
        </div>
      </div>
    </footer>
  );
}
