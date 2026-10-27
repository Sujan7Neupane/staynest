import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import EsewaPaymentButton from "../../../components/EsewaPaymentButton";
import CancelBookingButton from "../../../components/CancelBookingButton";

type BookingPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: { toString(): string }) {
  return `Rs. ${Number(price.toString()).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

  const nights = Math.ceil(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const canPay =
    isGuest &&
    booking.status === "PENDING" &&
    booking.paymentStatus === "PENDING";

  const canCancel =
    isGuest &&
    booking.status === "PENDING" &&
    booking.paymentStatus === "PENDING";

  const isPaid = booking.paymentStatus === "PAID";
  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href={`/bookings`}
        className="text-sm text-gray-600 hover:text-black"
      >
        &larr; Back to property
      </Link>

      <h1 className="mb-2 mt-4 text-3xl font-bold">Booking Confirmation</h1>

      <p className="mb-8 text-gray-600">
        Review the details of your stay and payment.
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 p-6">
            <h2 className="mb-4 text-xl font-semibold">Booking Information</h2>

            <div className="space-y-3 text-gray-700">
              <p className="break-all">
                <span className="font-medium">Booking ID:</span> {booking.id}
              </p>

              <p>
                <span className="font-medium">Booking Date:</span>{" "}
                {formatDate(booking.createdAt)}
              </p>

              <p>
                <span className="font-medium">Booking Status:</span>{" "}
                <span
                  className={`rounded px-2 py-1 text-sm ${
                    isConfirmed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status.replaceAll("_", " ")}
                </span>
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-6">
            <h2 className="mb-4 text-xl font-semibold">Stay Details</h2>

            <h3 className="text-lg font-semibold">{booking.property.title}</h3>

            <p className="mt-1 text-gray-600">
              {booking.property.address}, {booking.property.city},{" "}
              {booking.property.country}
            </p>

            {booking.room && (
              <p className="mt-3">
                <span className="font-medium">Room:</span> {booking.room.name}{" "}
                (Room {booking.room.roomNumber})
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{formatDate(booking.checkIn)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">{formatDate(booking.checkOut)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-medium">{booking.guests}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Nights</p>
                <p className="font-medium">{nights}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-6">
            <h2 className="mb-4 text-xl font-semibold">Payment Status</h2>

            <p className="mb-3 text-gray-700">Payment method: eSewa</p>

            <span
              className={`rounded px-3 py-1 text-sm ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {booking.paymentStatus}
            </span>

            {canPay && (
              <p className="mt-4 text-sm text-gray-600">
                Complete your payment to confirm your booking.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-gray-200 p-6">
          <h2 className="mb-5 text-xl font-semibold">Booking Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Guests</span>
              <span>{booking.guests}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Nights</span>
              <span>{nights}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Price per night</span>
              <span>{formatPrice(booking.pricePerNight)}</span>
            </div>

            <hr className="border-gray-200" />

            <div className="flex justify-between gap-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
          </div>

          {canPay && (
            <div className="mt-6">
              <EsewaPaymentButton bookingId={booking.id} />
            </div>
          )}

          {canCancel && (
            <div className={canPay ? "mt-3" : "mt-6"}>
              <CancelBookingButton bookingId={booking.id} />
            </div>
          )}

          {!canPay && !canCancel && (
            <Link
              href="/"
              className="mt-6 block w-full rounded-lg bg-black px-4 py-3 text-center font-medium text-white transition hover:bg-gray-800"
            >
              Back to homepage
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function BookingPage({ params }: BookingPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          Loading booking details...
        </main>
      }
    >
      <BookingDetails params={params} />
    </Suspense>
  );
}
