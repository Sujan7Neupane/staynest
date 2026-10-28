import z from "zod";

export const reviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});
