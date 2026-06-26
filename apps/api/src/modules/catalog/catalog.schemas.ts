import { z } from "zod";

import { slugSchemaPattern } from "../../utils/slug";

export const catalogFiltersSchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    category: z
      .string()
      .trim()
      .regex(slugSchemaPattern, "Category slug must be URL-friendly")
      .optional(),
    category_id: z.string().uuid().optional(),
    sellerSlug: z
      .string()
      .trim()
      .regex(slugSchemaPattern, "Seller slug must be URL-friendly")
      .optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    },
  );

export const catalogProductSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(slugSchemaPattern, "Product slug must be URL-friendly"),
});

export type CatalogFiltersInput = z.infer<typeof catalogFiltersSchema>;
