import { HttpError } from "../../utils/http-error";
import {
  findPublicStoreBySlug,
  listPublicStores,
} from "./stores.repository";
import type { StoresFiltersInput } from "./stores.schemas";

export function getPublicStores(filters: StoresFiltersInput) {
  return listPublicStores(filters);
}

export async function getPublicStoreBySlug(slug: string) {
  const store = await findPublicStoreBySlug(slug);

  if (!store) {
    throw new HttpError(404, "Store was not found");
  }

  return store;
}
