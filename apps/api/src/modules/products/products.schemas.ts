import { z } from "zod";

import { slugSchemaPattern } from "../../utils/slug";

const uuid = z.string().uuid();
const requiredText = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const price = z.coerce.number().nonnegative();
const stock = z.coerce.number().int().nonnegative();

export const productStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "rejected",
]);

export const createProductSchema = z
  .object({
    category_id: uuid,
    name: requiredText.max(200),
    slug: requiredText
      .max(220)
      .regex(slugSchemaPattern, "Slug must use lowercase letters, numbers, and hyphens"),
    description: optionalText,
    price,
    stock,
    material: optionalText,
    color: optionalText,
    size: optionalText,
    status: z.enum(["draft", "active"]).default("draft"),
  })
  .strict();

export const updateProductSchema = z
  .object({
    category_id: uuid.optional(),
    name: requiredText.max(200).optional(),
    slug: requiredText
      .max(220)
      .regex(slugSchemaPattern, "Slug must use lowercase letters, numbers, and hyphens")
      .optional(),
    description: optionalText,
    price: price.optional(),
    stock: stock.optional(),
    material: optionalText,
    color: optionalText,
    size: optionalText,
    status: productStatusSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const updateProductStatusSchema = z
  .object({
    status: z.enum(["draft", "active", "inactive"]),
  })
  .strict();

export const sellerProductFiltersSchema = z.object({
  status: productStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  category_id: uuid.optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export type SellerProductFiltersInput = z.infer<typeof sellerProductFiltersSchema>;
