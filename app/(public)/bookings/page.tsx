import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "GUEST") {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      guestId: session.user.id,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          country: true,
          imageUrl: true,
        },
      },
      room: {
        select: {
          roomNumber: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <p className="mt-2 text-gray-600">View and manage your reservations.</p>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold">No bookings yet</h2>
          <p className="mt-2 text-gray-600">
            Your reservations will appear here when you book a stay.
          </p>
          <Link
            href="/properties"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Explore properties
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-xl font-semibold">
                    {booking.property.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {booking.property.city}, {booking.property.country}
                  </p>

                  {booking.room && (
                    <p className="mt-2 text-sm text-gray-600">
                      Room: {booking.room.name} ({booking.room.roomNumber})
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="text-xl font-semibold">
                    {Number(booking.totalPrice).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="mt-1 font-medium">
                    {booking.checkIn.toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Check-out</p>
                  <p className="mt-1 font-medium">
                    {booking.checkOut.toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Booking status</p>
                  <p className="mt-1 font-medium">
                    {booking.status.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Payment status</p>
                  <p className="mt-1 font-medium">
                    {booking.paymentStatus.replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <Link
                  href={`/bookings/${booking.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  View booking details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
