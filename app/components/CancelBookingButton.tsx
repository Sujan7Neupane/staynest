"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "./ui/Button";

type CancelBookingButtonProps = {
  bookingId: string;
};

export default function CancelBookingButton({
  bookingId,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      await axios.patch(`/api/bookings/${bookingId}/cancel`);

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            "Unable to cancel the booking. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? "Cancelling..." : "Cancel Booking"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
