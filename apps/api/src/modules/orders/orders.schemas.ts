import { z } from "zod";

const requiredText = z.string().trim().min(1);
const optionalDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
  .optional();

export const createOrderSchema = z
  .object({
    delivery_full_name: requiredText.max(200),
    delivery_phone: requiredText.max(30),
    delivery_address: requiredText,
    delivery_reference: z.string().trim().optional(),
  })
  .strict();

export const orderParamsSchema = z.object({
  id: z.string().uuid(),
});

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const sellerOrderStatusSchema = z.enum([
  "pending",
  "in_preparation",
  "shipped",
  "delivered",
  "cancelled",
]);

export const buyerOrderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  from: optionalDate,
  to: optionalDate,
});

export const sellerOrderFiltersSchema = z.object({
  status: sellerOrderStatusSchema.optional(),
  from: optionalDate,
  to: optionalDate,
});

export const adminOrderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  from: optionalDate,
  to: optionalDate,
  search: z.string().trim().min(1).optional(),
  order_code: z.string().trim().min(1).optional(),
});

export const trackOrderQuerySchema = z.object({
  orderCode: requiredText.max(80),
  phone: requiredText.max(30),
});

export const updateSellerOrderStatusSchema = z
  .object({
    status: z.enum(["in_preparation", "shipped", "delivered", "cancelled"]),
    note: z.string().trim().min(1).optional(),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type BuyerOrderFiltersInput = z.infer<typeof buyerOrderFiltersSchema>;
export type SellerOrderFiltersInput = z.infer<typeof sellerOrderFiltersSchema>;
export type AdminOrderFiltersInput = z.infer<typeof adminOrderFiltersSchema>;
export type TrackOrderQueryInput = z.infer<typeof trackOrderQuerySchema>;
export type UpdateSellerOrderStatusInput = z.infer<
  typeof updateSellerOrderStatusSchema
>;
