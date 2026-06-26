"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BuyerOrderCard } from "@/components/orders/BuyerOrderCard";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getMyOrders } from "@/lib/ordersApi";
import { routes } from "@/lib/routes";
import type { OrderSummary } from "@/types/api";

function BuyerOrdersContent() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para ver tus pedidos.");
      return;
    }

    getMyOrders(token)
      .then((response) => setOrders(response.orders))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar los pedidos",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-ink">Mis pedidos</h1>
          <p className="mt-2 text-ink/65">Consulta el estado de tus compras.</p>
        </div>
        <Link className="font-bold text-mineral hover:text-ink" href={routes.catalog}>
          Ver catalogo
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div className="h-36 animate-pulse rounded-md bg-white shadow-soft" key={item} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-ink">Aun no tienes pedidos</h2>
          <p className="mt-2 text-ink/60">Cuando confirmes una compra aparecera aqui.</p>
          <Link
            className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-bold text-white"
            href={routes.catalog}
          >
            Explorar catalogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <BuyerOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function BuyerOrdersPage() {
  return <ProtectedPage role="buyer">{() => <BuyerOrdersContent />}</ProtectedPage>;
}
