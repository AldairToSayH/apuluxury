"use client";

import { FormEvent, useState } from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ApiError } from "@/lib/apiClient";
import { trackOrder } from "@/lib/trackingApi";
import type { TrackedOrder } from "@/types/api";

function formatMoney(value: number, currency: string) {
  const symbol = currency === "PEN" ? "S/" : currency;

  return `${symbol} ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TrackOrderPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const orderCode = String(form.get("orderCode") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    setError("");
    setOrder(null);
    setIsLoading(true);

    try {
      const response = await trackOrder(orderCode, phone);
      setOrder(response.order);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No encontramos un pedido con esos datos.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="site-shell">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="eyebrow">Rastreo publico</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
            Rastrea tu pedido APU LUXURY
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink/64">
            Ingresa el codigo que recibiste al confirmar tu compra y el telefono
            de entrega. Asi protegemos la informacion de tu pedido.
          </p>

          <form className="luxury-card mt-8 grid gap-4 p-6" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-ink/72">
              Codigo de pedido
              <input
                className="form-field"
                name="orderCode"
                placeholder="Ejemplo: APU-20260621-ABC123"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink/72">
              Telefono de entrega
              <input
                className="form-field"
                name="phone"
                placeholder="Ejemplo: 999999999"
                required
              />
            </label>
            <p className="text-sm text-ink/58">
              Ingresa el codigo que recibiste al confirmar tu compra.
            </p>
            {error && <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <button className="primary-action w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Buscando pedido..." : "Rastrear pedido"}
            </button>
          </form>
        </div>

        <div className="luxury-card p-6">
          {!order ? (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <p className="eyebrow">Estado del pedido</p>
                <h2 className="mt-3 text-3xl font-black text-ink">
                  Tu resultado aparecera aqui
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink/60">
                  Podras ver el estado general, vendedores e items del pedido sin
                  iniciar sesion.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-copper">
                    Codigo de pedido
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-ink">{order.orderCode}</h2>
                  <p className="mt-2 text-sm text-ink/60">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="premium-surface p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/50">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-black text-copper">
                    {formatMoney(order.totalAmount, order.currency)}
                  </p>
                </div>
                <div className="premium-surface p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/50">
                    Estado general
                  </p>
                  <div className="mt-2">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {order.sellerOrders.map((sellerOrder) => (
                  <article
                    className="rounded-md border border-ink/10 bg-cloud/70 p-4"
                    key={`${sellerOrder.sellerCommercialName}-${sellerOrder.status}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-ink">
                          {sellerOrder.sellerCommercialName}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-copper">
                          {formatMoney(sellerOrder.subtotalAmount, order.currency)}
                        </p>
                      </div>
                      <OrderStatusBadge status={sellerOrder.status} />
                    </div>
                    <div className="mt-4 divide-y divide-ink/10">
                      {sellerOrder.items.map((item) => (
                        <div
                          className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto_auto]"
                          key={`${sellerOrder.sellerCommercialName}-${item.productName}`}
                        >
                          <span className="font-bold text-ink">{item.productName}</span>
                          <span className="text-ink/62">Cantidad {item.quantity}</span>
                          <span className="font-bold text-copper">
                            {formatMoney(item.subtotal, order.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
