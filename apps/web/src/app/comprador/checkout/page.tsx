"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CheckoutForm } from "@/components/orders/CheckoutForm";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getCart } from "@/lib/cartApi";
import { createOrder } from "@/lib/ordersApi";
import { routes } from "@/lib/routes";
import type { Cart, CreateOrderPayload } from "@/types/api";

function CheckoutContent() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasItems = useMemo(() => Boolean(cart && cart.items.length > 0), [cart]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para continuar.");
      return;
    }

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
  }, []);

  const handleSubmit = async (payload: CreateOrderPayload) => {
    const token = getToken();

    if (!token) {
      router.push(routes.login);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await createOrder(token, payload);
      setSuccess("Pedido creado correctamente.");
      router.push(`/comprador/pedidos/${response.order.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo crear el pedido",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Confirma tu pedido</h1>
          <p className="mt-2 text-ink/65">Confirma tus datos de entrega.</p>
        </div>
        <Link className="secondary-action" href={routes.buyerCart}>
          Volver al carrito
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
          <div className="h-72 animate-pulse rounded-md bg-white shadow-soft" />
        </div>
      ) : !hasItems || !cart ? (
        <div className="empty-state">
          <h2 className="text-2xl font-black text-ink">Tu carrito esta vacio</h2>
          <p className="mt-2 text-ink/60">Agrega productos antes de crear un pedido.</p>
          <Link
            className="primary-action mt-6"
            href={routes.catalog}
          >
            Ver catalogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          <OrderSummary cart={cart} />
        </div>
      )}
    </section>
  );
}

export default function CheckoutPage() {
  return <ProtectedPage role="buyer">{() => <CheckoutContent />}</ProtectedPage>;
}
