import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const updateSellerProfileSchema = z
  .object({
    commercial_name: optionalText,
    phone: optionalText,
    address: optionalText,
    business_description: optionalText,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateSellerProfileInput = z.infer<
  typeof updateSellerProfileSchema
>;
