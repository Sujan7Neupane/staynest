import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["GUEST", "HOST"], {
    error: "Role must be either GUEST or HOST",
  }),
});
