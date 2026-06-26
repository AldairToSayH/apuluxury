"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { clearCart, getCart, removeCartItem, updateCartItem } from "@/lib/cartApi";
import type { Cart } from "@/types/api";

function BuyerCartContent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const totalAmount = useMemo(() => {
    if (!cart) {
      return 0;
    }

    return cart.totalAmount || cart.items.reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);

  const loadCart = () => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para ver tu carrito.");
      return;
    }

    setIsLoading(true);
    setError("");

    getCart(token)
      .then((response) => setCart(response.cart))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el carrito",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdate = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Inicia sesion para actualizar tu carrito.");
      return;
    }

    setBusyItemId(cartItemId);
    setError("");
    setSuccess("");

    try {
      const response = await updateCartItem(token, cartItemId, quantity);
      setCart(response.cart);
      setSuccess("Carrito actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el producto",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    const token = getToken();

    if (!token) {
      setError("Inicia sesion para actualizar tu carrito.");
      return;
    }

    setBusyItemId(cartItemId);
    setError("");
    setSuccess("");

    try {
      const response = await removeCartItem(token, cartItemId);
      setCart(response.cart);
      setSuccess("Producto eliminado del carrito.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo eliminar el producto",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Quieres vaciar tu carrito?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Inicia sesion para actualizar tu carrito.");
      return;
    }

    setIsClearing(true);
    setError("");
    setSuccess("");

    try {
      const response = await clearCart(token);
      setCart(response.cart);
      setSuccess("Carrito vacio.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo vaciar el carrito",
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Carrito</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Mi carrito</h1>
          <p className="mt-2 text-ink/65">Revisa tus productos antes de crear el pedido.</p>
        </div>
        <Link className="secondary-action" href="/catalogo">
          Seguir comprando
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            {[0, 1].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-md bg-white shadow-soft" />
            ))}
          </div>
          <div className="h-56 animate-pulse rounded-md bg-white shadow-soft" />
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="empty-state">
          <h2 className="text-2xl font-black text-ink">Tu carrito esta vacio</h2>
          <p className="mt-2 text-ink/60">Explora el catalogo y agrega piezas a tu carrito.</p>
          <Link
            className="primary-action mt-6"
            href="/catalogo"
          >
            Ver catalogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.cartItemId}
                item={item}
                isBusy={busyItemId === item.cartItemId || isClearing}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <CartSummary
            totalAmount={totalAmount}
            totalQuantity={cart.totalQuantity}
            onClear={handleClear}
            checkoutHref="/comprador/checkout"
            isClearing={isClearing}
            isDisabled={cart.items.length === 0}
          />
        </div>
      )}
    </section>
  );
}

export default function BuyerCartPage() {
  return <ProtectedPage role="buyer">{() => <BuyerCartContent />}</ProtectedPage>;
}
