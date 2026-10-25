"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Room } from "../../../lib/types/room";

type BookingFormProps = {
  propertyId: string;
  propertyType: "HOTEL" | "VACATION_RENTAL";
  propertyPrice: number | string;
  propertyMaxGuests: number;
  rooms: Room[];
};

type FormValues = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export default function BookingForm({
  propertyId,
  propertyType,
  propertyPrice,
  propertyMaxGuests,
  rooms,
}: BookingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { roomId: "", checkIn: "", checkOut: "", guests: 1 },
  });

  const isHotel = propertyType === "HOTEL";
  const roomId = watch("roomId");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  const availableRooms = rooms.filter((room) => room.status === "AVAILABLE");
  const selectedRoom = rooms.find((room) => room.id === roomId);

  const pricePerNight = isHotel
    ? Number(selectedRoom?.pricePerNight ?? 0)
    : Number(propertyPrice);

  const maxGuests = isHotel
    ? (selectedRoom?.maxGuests ?? 0)
    : propertyMaxGuests;

  const oneDay = 24 * 60 * 60 * 1000;
  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / oneDay,
        )
      : 0;

  const totalPrice = nights > 0 ? pricePerNight * nights : 0;
  const today = new Date().toLocaleDateString("en-CA");

  async function onSubmit(values: FormValues) {
    setServerError("");

    try {
      const response = await axios.post("/api/bookings", {
        propertyId,
        ...(isHotel ? { roomId: values.roomId } : {}),
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
      });

      router.push(`/bookings/${response.data.booking.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to create booking.",
        );
      } else {
        setServerError("Something went wrong.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
      {isHotel && (
        <div>
          <label htmlFor="roomId" className="mb-2 block text-sm font-medium">
            Select a room
          </label>

          <select
            id="roomId"
            {...register("roomId", { required: "Please select a room." })}
            className="w-full rounded-lg border border-gray-300 px-3 py-3"
          >
            <option value="">Choose a room</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — Room {room.roomNumber} (
                {Number(room.pricePerNight).toFixed(2)} / night)
              </option>
            ))}
          </select>

          {availableRooms.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No rooms are currently listed as available.
            </p>
          )}
          {errors.roomId && (
            <p className="mt-2 text-sm text-red-600">{errors.roomId.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="checkIn" className="mb-2 block text-sm font-medium">
          Check-in
        </label>
        <input
          id="checkIn"
          type="date"
          min={today}
          {...register("checkIn", {
            required: "Please select a check-in date.",
          })}
          className="w-full rounded-lg border border-gray-300 px-3 py-3"
        />
        {errors.checkIn && (
          <p className="mt-2 text-sm text-red-600">{errors.checkIn.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="checkOut" className="mb-2 block text-sm font-medium">
          Check-out
        </label>
        <input
          id="checkOut"
          type="date"
          min={checkIn || today}
          {...register("checkOut", {
            required: "Please select a check-out date.",
            validate: (value) =>
              value > checkIn || "Check-out must be after check-in.",
          })}
          className="w-full rounded-lg border border-gray-300 px-3 py-3"
        />
        {errors.checkOut && (
          <p className="mt-2 text-sm text-red-600">{errors.checkOut.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="guests" className="mb-2 block text-sm font-medium">
          Number of guests
        </label>
        <input
          id="guests"
          type="number"
          {...register("guests", {
            valueAsNumber: true,
            min: { value: 1, message: "At least one guest is required." },
            validate: (value) =>
              maxGuests === 0 ||
              value <= maxGuests ||
              `Maximum guests allowed: ${maxGuests}.`,
          })}
          className="w-full rounded-lg border border-gray-300 px-3 py-3"
        />
        {errors.guests && (
          <p className="mt-2 text-sm text-red-600">{errors.guests.message}</p>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          {nights > 0 ? `${nights} night(s)` : "Select your dates"}
        </p>
        <p className="mt-2 text-xl font-semibold">
          {totalPrice.toFixed(2)}
          <span className="ml-1 text-sm font-normal text-gray-500">total</span>
        </p>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating booking..." : "Continue to payment"}
      </button>
    </form>
  );
}
