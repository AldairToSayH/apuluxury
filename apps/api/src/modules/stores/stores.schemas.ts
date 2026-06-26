import { z } from "zod";

import { slugSchemaPattern } from "../../utils/slug";

export const storesFiltersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  category_id: z.string().uuid().optional(),
});

export const storeSlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(slugSchemaPattern, "Store slug must be URL-friendly"),
});

export type StoresFiltersInput = z.infer<typeof storesFiltersSchema>;
