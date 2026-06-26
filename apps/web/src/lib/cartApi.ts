import { apiClient } from "@/lib/apiClient";
import type { Cart } from "@/types/api";

type CartResponse = {
  cart: Cart;
};

export function getCart(token: string) {
  return apiClient<CartResponse>("/api/cart", { token });
}

export function addCartItem(token: string, productId: string, quantity: number) {
  return apiClient<CartResponse>("/api/cart/items", {
    method: "POST",
    token,
    body: {
      product_id: productId,
      quantity,
    },
  });
}

export function updateCartItem(
  token: string,
  cartItemId: string,
  quantity: number,
) {
  return apiClient<CartResponse>(`/api/cart/items/${cartItemId}`, {
    method: "PATCH",
    token,
    body: { quantity },
  });
}

export function removeCartItem(token: string, cartItemId: string) {
  return apiClient<CartResponse>(`/api/cart/items/${cartItemId}`, {
    method: "DELETE",
    token,
  });
}

export function clearCart(token: string) {
  return apiClient<CartResponse>("/api/cart", {
    method: "DELETE",
    token,
  });
}
