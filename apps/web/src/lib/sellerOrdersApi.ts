import { apiClient } from "@/lib/apiClient";
import type { SellerOrderDetail, SellerOrderStatus, SellerOrderSummary } from "@/types/api";

type SellerOrdersResponse = {
  sellerOrders: SellerOrderSummary[];
};

type SellerOrderResponse = {
  sellerOrder: SellerOrderDetail;
};

export type SellerOrderFilters = {
  status?: SellerOrderStatus;
  from?: string;
  to?: string;
};

export type SellerOrderUpdateStatus = Exclude<SellerOrderStatus, "pending">;

function toQueryString(filters?: SellerOrderFilters) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.from) {
    params.set("from", filters.from);
  }

  if (filters?.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getSellerOrders(token: string, filters?: SellerOrderFilters) {
  return apiClient<SellerOrdersResponse>(
    `/api/orders/seller${toQueryString(filters)}`,
    { token },
  );
}

export function getSellerOrderDetail(token: string, id: string) {
  return apiClient<SellerOrderResponse>(`/api/orders/seller/${id}`, { token });
}

export function updateSellerOrderStatus(
  token: string,
  id: string,
  status: SellerOrderUpdateStatus,
) {
  return apiClient<SellerOrderResponse>(`/api/orders/seller/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
