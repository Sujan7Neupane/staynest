import { z } from "zod";

export const bookingSchema = z
  .object({
    propertyId: z.string().trim().min(1, "Property ID is required"),
    roomId: z.string().trim().optional(),
    checkIn: z.iso.date("Invalid check-in date"),
    checkOut: z.iso.date("Invalid check-out date"),
    guests: z.number().int().min(1, "At least one guest is required"),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export const cancelBookingSchema = z.object({
  status: z.literal("CANCELLED"),
});
