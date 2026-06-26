import { apiClient } from "@/lib/apiClient";
import type { PublicStore, PublicStoreDetail } from "@/types/api";

export type StoreFilters = {
  search?: string;
  category_id?: string;
};

function toQueryString(filters: StoreFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.category_id) {
    params.set("category_id", filters.category_id);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getStores(filters?: StoreFilters) {
  return apiClient<{ stores: PublicStore[] }>(
    `/api/stores${toQueryString(filters)}`,
  );
}

export function getStoreDetail(slug: string) {
  return apiClient<{ store: PublicStoreDetail }>(`/api/stores/${slug}`);
}
