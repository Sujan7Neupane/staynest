import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z.string().trim().min(1, "Room number is required"),
  name: z.string().trim().min(1, "Room name is required"),
  description: z.string().optional(),
  pricePerNight: z.number().positive("Price must be greater than 0"),
  maxGuests: z.number().int().positive("Maximum guests must be at least 1"),
});

export const updateRoomSchema = roomSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
