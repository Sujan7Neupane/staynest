import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  type: z.enum(["HOTEL", "VACATION_RENTAL"]),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().min(2, "Country is required"),
  pricePerNight: z
    .string()
    .trim()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Enter a valid price with up to 2 decimal places",
    )
    .refine((value) => Number(value) > 0, "Price must be greater than zero"),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest is required"),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce.number().int().min(1, "At least 1 bathroom is required"),
});
