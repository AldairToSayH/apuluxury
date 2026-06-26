import { apiClient } from "@/lib/apiClient";
import type { AdminSeller, SellerValidationStatus } from "@/types/api";

type AdminSellersResponse = {
  sellers: AdminSeller[];
};

type AdminSellerResponse = {
  seller: AdminSeller;
};

export type AdminSellerFilters = {
  validation_status?: SellerValidationStatus | "";
  search?: string;
};

function toQueryString(filters: AdminSellerFilters = {}) {
  const params = new URLSearchParams();

  if (filters.validation_status) {
    params.set("validation_status", filters.validation_status);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getAdminSellers(token: string, filters?: AdminSellerFilters) {
  return apiClient<AdminSellersResponse>(
    `/api/admin/sellers${toQueryString(filters)}`,
    { token },
  );
}

export function approveSeller(token: string, id: string) {
  return apiClient<AdminSellerResponse>(`/api/admin/sellers/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export function rejectSeller(token: string, id: string) {
  return apiClient<AdminSellerResponse>(`/api/admin/sellers/${id}/reject`, {
    method: "PATCH",
    token,
    body: {},
  });
}

export function suspendSeller(token: string, id: string) {
  return apiClient<AdminSellerResponse>(`/api/admin/sellers/${id}/suspend`, {
    method: "PATCH",
    token,
  });
}
