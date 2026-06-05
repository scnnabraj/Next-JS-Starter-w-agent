import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
