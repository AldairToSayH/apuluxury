"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/lib/apiClient";
import { getCurrentUser, getToken } from "@/lib/auth";
import { addCartItem } from "@/lib/cartApi";
import { routes } from "@/lib/routes";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
};

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOutOfStock = stock <= 0;

  const handleAdd = async () => {
    setError("");
    setMessage("");

    if (quantity < 1) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await getCurrentUser();

      if (!session) {
        router.push(routes.login);
        return;
      }

      if (session.user.role !== "buyer") {
        setError("Solo una cuenta de comprador puede agregar productos al carrito.");
        return;
      }

      const token = getToken();

      if (!token) {
        router.push(routes.login);
        return;
      }

      await addCartItem(token, productId, quantity);
      setMessage("Producto agregado al carrito.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo agregar el producto al carrito",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          Cantidad
          <input
            className="h-11 w-24 rounded-md border border-ink/15 bg-white px-3"
            min={1}
            max={Math.max(stock, 1)}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={isSubmitting || isOutOfStock}
          />
        </label>
        <button
          className="primary-action"
          type="button"
          onClick={handleAdd}
          disabled={isSubmitting || isOutOfStock}
        >
          {isSubmitting ? "Agregando..." : "Agregar al carrito"}
        </button>
      </div>
      {isOutOfStock && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Este producto no tiene stock disponible.
        </p>
      )}
      {message && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>
      )}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
