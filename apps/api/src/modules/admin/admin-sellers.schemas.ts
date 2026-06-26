import { z } from "zod";

export const sellerValidationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const adminSellersQuerySchema = z.object({
  validation_status: sellerValidationStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export const rejectSellerSchema = z
  .object({
    note: z.string().trim().min(1).optional(),
  })
  .strict();

export type AdminSellersQueryInput = z.infer<typeof adminSellersQuerySchema>;
export type RejectSellerInput = z.infer<typeof rejectSellerSchema>;
