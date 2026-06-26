import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const updateBuyerProfileSchema = z
  .object({
    first_name: optionalText,
    last_name: optionalText,
    dni: optionalText,
    phone: optionalText,
    address: optionalText,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;
