import { apiClient } from "@/lib/apiClient";
import type { OrderDetail, OrderStatus, OrderSummary } from "@/types/api";

type AdminOrdersResponse = {
  orders: OrderSummary[];
};

type AdminOrderResponse = {
  order: OrderDetail;
};

export type AdminOrderFilters = {
  status?: OrderStatus | "";
  from?: string;
  to?: string;
  search?: string;
  order_code?: string;
};

function toQueryString(filters: AdminOrderFilters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.order_code) {
    params.set("order_code", filters.order_code);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getAdminOrders(token: string, filters?: AdminOrderFilters) {
  return apiClient<AdminOrdersResponse>(
    `/api/admin/orders${toQueryString(filters)}`,
    { token },
  );
}

export function getAdminOrderDetail(token: string, id: string) {
  return apiClient<AdminOrderResponse>(`/api/admin/orders/${id}`, { token });
}
