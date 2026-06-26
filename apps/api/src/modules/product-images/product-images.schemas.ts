import { z } from "zod";

export const productImageParamsSchema = z.object({
  productId: z.string().uuid(),
});

export const productImageDetailParamsSchema = productImageParamsSchema.extend({
  imageId: z.string().uuid(),
});

export const createProductImageSchema = z
  .object({
    image_url: z.string().trim().url(),
    alt_text: z.string().trim().min(1).max(255).optional(),
    position: z.coerce.number().int().nonnegative().optional(),
    is_main: z.boolean().optional(),
  })
  .strict();

export const updateProductImageSchema = z
  .object({
    image_url: z.string().trim().url().optional(),
    alt_text: z.string().trim().min(1).max(255).optional(),
    position: z.coerce.number().int().nonnegative().optional(),
    is_main: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProductImageInput = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageInput = z.infer<typeof updateProductImageSchema>;
