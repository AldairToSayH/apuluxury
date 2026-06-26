import { apiClient } from "@/lib/apiClient";
import type { AdminProduct, AdminProductDetail, ProductStatus } from "@/types/api";

type AdminProductsResponse = {
  products: AdminProduct[];
};

type AdminProductResponse = {
  product: AdminProductDetail;
  note?: string;
};

export type AdminProductFilters = {
  status?: ProductStatus | "";
  search?: string;
  category_id?: string;
  seller_id?: string;
  from?: string;
  to?: string;
};

export type AdminProductModerationPayload = {
  status?: ProductStatus;
  category_id?: string;
};

function toQueryString(filters: AdminProductFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.category_id) {
    params.set("category_id", filters.category_id);
  }

  if (filters.seller_id) {
    params.set("seller_id", filters.seller_id);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getAdminProducts(token: string, filters?: AdminProductFilters) {
  return apiClient<AdminProductsResponse>(
    `/api/admin/products${toQueryString(filters)}`,
    { token },
  );
}

export function getAdminProductDetail(token: string, id: string) {
  return apiClient<AdminProductResponse>(`/api/admin/products/${id}`, { token });
}

export function updateAdminProductStatus(
  token: string,
  id: string,
  status: ProductStatus,
  note?: string,
) {
  return apiClient<AdminProductResponse>(`/api/admin/products/${id}/status`, {
    method: "PATCH",
    token,
    body: {
      status,
      ...(note && { note }),
    },
  });
}

export function updateAdminProductModeration(
  token: string,
  id: string,
  payload: AdminProductModerationPayload,
) {
  return apiClient<AdminProductResponse>(`/api/admin/products/${id}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}
