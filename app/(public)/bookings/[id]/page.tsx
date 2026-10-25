import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/prisma/client";

type BookingPageProps = {
  params: Promise<{ id: string }>;
};

async function BookingDetails({ params }: BookingPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: true,
      room: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.property.hostId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isGuest && !isHost && !isAdmin) {
    redirect("/");
  }

  const canPay =
    isGuest &&
    booking.status === "PENDING" &&
    booking.paymentStatus === "PENDING";

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <Link
          href={`/properties/${booking.propertyId}`}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to property
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">Booking details</h1>

        <p className="mt-2 text-sm text-gray-500">Booking ID: {booking.id}</p>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold">{booking.property.title}</h2>

        <p className="text-gray-600">
          {booking.property.address}, {booking.property.city},{" "}
          {booking.property.country}
        </p>

        {booking.room && (
          <p>
            <span className="font-medium">Room:</span> {booking.room.name} (Room{" "}
            {booking.room.roomNumber})
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Check-in</p>
            <p className="font-medium">
              {booking.checkIn.toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Check-out</p>
            <p className="font-medium">
              {booking.checkOut.toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Guests</p>
            <p className="font-medium">{booking.guests}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between">
          <span>Price per night</span>
          <span>Rs. {booking.pricePerNight.toString()}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold">
          <span>Total price</span>
          <span>Rs. {booking.totalPrice.toString()}</span>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">Booking status</h2>

        <p className="mt-2">
          Booking: <span className="font-medium">{booking.status}</span>
        </p>

        <p className="mt-1">
          Payment: <span className="font-medium">{booking.paymentStatus}</span>
        </p>

        {canPay && (
          <p className="mt-4 text-sm text-gray-600">
            Your booking is pending payment. We will add the eSewa payment
            option here next.
          </p>
        )}
      </section>
    </main>
  );
}

export default function BookingPage({ params }: BookingPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          Loading booking details...
        </main>
      }
    >
      <BookingDetails params={params} />
    </Suspense>
  );
}
