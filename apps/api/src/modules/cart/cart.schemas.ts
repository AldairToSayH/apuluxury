import { z } from "zod";

export const addCartItemSchema = z
  .object({
    product_id: z.string().uuid(),
    quantity: z.coerce.number().int().positive(),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().positive(),
  })
  .strict();

export const cartItemParamsSchema = z.object({
  id: z.string().uuid(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
