import { apiClient } from "@/lib/apiClient";
import type { TrackedOrder } from "@/types/api";

export function trackOrder(orderCode: string, phone: string) {
  const query = new URLSearchParams({
    orderCode,
    phone,
  });

  return apiClient<{ order: TrackedOrder }>(`/api/orders/track?${query.toString()}`);
}
