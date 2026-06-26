import { apiClient } from "@/lib/apiClient";
import type { CreateOrderPayload, OrderDetail, OrderStatus, OrderSummary } from "@/types/api";

type OrderResponse = {
  order: OrderDetail;
};

type OrdersResponse = {
  orders: OrderSummary[];
};

export type BuyerOrderFilters = {
  status?: OrderStatus;
  from?: string;
  to?: string;
};

function toQueryString(filters?: BuyerOrderFilters) {
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

export function createOrder(token: string, payload: CreateOrderPayload) {
  return apiClient<OrderResponse>("/api/orders", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getMyOrders(token: string, filters?: BuyerOrderFilters) {
  return apiClient<OrdersResponse>(`/api/orders/my${toQueryString(filters)}`, {
    token,
  });
}

export function getMyOrderDetail(token: string, id: string) {
  return apiClient<OrderResponse>(`/api/orders/my/${id}`, { token });
}
