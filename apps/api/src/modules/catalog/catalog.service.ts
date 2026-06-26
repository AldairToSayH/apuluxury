import { HttpError } from "../../utils/http-error";
import {
  findCatalogProductBySlug,
  listCatalogProducts,
} from "./catalog.repository";
import type { CatalogFiltersInput } from "./catalog.schemas";

export function getCatalogProducts(filters: CatalogFiltersInput) {
  return listCatalogProducts(filters);
}

export async function getCatalogProductBySlug(slug: string) {
  const product = await findCatalogProductBySlug(slug);

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return product;
}
