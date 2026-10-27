"use client";

import { useState } from "react";
import axios from "axios";
import Button from "./ui/Button";

type EsewaPaymentButtonProps = {
  bookingId: string;
};

export default function EsewaPaymentButton({
  bookingId,
}: EsewaPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      // console.log(bookingId);

      const response = await axios.get(`/api/bookings/${bookingId}/payment`);
      // console.log(response);

      const detail = response.data;
      // console.log(detail);

      const form = document.createElement("form");
      form.method = "POST";
      form.action =
        process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL ||
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      Object.entries(detail).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      });

      // console.log(form);

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            "Unable to start eSewa payment. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }

      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full cursor-pointer rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to eSewa..." : "Pay with eSewa"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
