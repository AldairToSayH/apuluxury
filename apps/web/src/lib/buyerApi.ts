import { apiClient } from "@/lib/apiClient";
import type { BuyerProfile } from "@/types/api";

export type BuyerProfileValues = {
  first_name?: string;
  last_name?: string;
  dni?: string;
  phone?: string;
  address?: string;
};

export function getBuyerProfile(token: string) {
  return apiClient<{ buyer: BuyerProfile }>("/api/buyers/me", { token });
}

export function updateBuyerProfile(
  token: string,
  values: BuyerProfileValues,
) {
  return apiClient<{ buyer: BuyerProfile }>("/api/buyers/me", {
    method: "PATCH",
    token,
    body: values,
  });
}
