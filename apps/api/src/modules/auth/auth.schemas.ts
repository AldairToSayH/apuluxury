import { z } from "zod";

const requiredText = z.string().trim().min(1);
const urlSegment = requiredText.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Value must use lowercase letters, numbers, and hyphens",
);

export const registerBuyerSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8, "Password must have at least 8 characters"),
  first_name: requiredText.max(100),
  last_name: requiredText.max(100),
  dni: requiredText.max(20),
  phone: requiredText.max(30),
});

export const registerSellerSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8, "Password must have at least 8 characters"),
  commercial_name: requiredText.max(150),
  subdomain: urlSegment.max(160),
  ruc: requiredText.max(20),
  phone: requiredText.max(30),
  address: requiredText,
  business_description: requiredText,
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;
export type RegisterSellerInput = z.infer<typeof registerSellerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
