"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { SellerOrderCard } from "@/components/orders/SellerOrderCard";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getSellerOrders,
  type SellerOrderFilters,
} from "@/lib/sellerOrdersApi";
import type { SellerOrderStatus, SellerOrderSummary } from "@/types/api";

const statusOptions: Array<
  { value: ""; label: string } | { value: SellerOrderStatus; label: string }
> = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "in_preparation", label: "En preparacion" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

function SellerOrdersContent() {
  const [sellerOrders, setSellerOrders] = useState<SellerOrderSummary[]>([]);
  const [filters, setFilters] = useState<SellerOrderFilters>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSellerOrders = (nextFilters: SellerOrderFilters = filters) => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para ver tus pedidos.");
      return;
    }

    setIsLoading(true);
    setError("");

    getSellerOrders(token, nextFilters)
      .then((response) => setSellerOrders(response.sellerOrders))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar los pedidos recibidos",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSellerOrders({});
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const status = String(form.get("status") ?? "") as SellerOrderStatus | "";
    const from = String(form.get("from") ?? "");
    const to = String(form.get("to") ?? "");
    const nextFilters: SellerOrderFilters = {};

    if (status) {
      nextFilters.status = status;
    }

    if (from) {
      nextFilters.from = from;
    }

    if (to) {
      nextFilters.to = to;
    }

    setFilters(nextFilters);
    loadSellerOrders(nextFilters);
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Vendedor</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Pedidos recibidos</h1>
          <p className="mt-2 text-ink/65">Gestiona las ordenes asignadas a tu tienda.</p>
        </div>
        <Link className="secondary-action" href="/vendedor">
          Volver al panel
        </Link>
      </div>

      <form
        className="luxury-card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={handleSubmit}
      >
        <select
          className="form-field"
          name="status"
          defaultValue={filters.status ?? ""}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="form-field"
          name="from"
          type="date"
          defaultValue={filters.from ?? ""}
        />
        <input
          className="form-field"
          name="to"
          type="date"
          defaultValue={filters.to ?? ""}
        />
        <button className="primary-action" type="submit">
          Filtrar
        </button>
      </form>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div className="h-32 animate-pulse rounded-md bg-white shadow-soft" key={item} />
          ))}
        </div>
      ) : sellerOrders.length === 0 ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-ink">No tienes pedidos recibidos</h2>
          <p className="mt-2 text-ink/60">
            Cuando un comprador confirme una compra aparecera aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellerOrders.map((sellerOrder) => (
            <SellerOrderCard key={sellerOrder.id} sellerOrder={sellerOrder} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function SellerOrdersPage() {
  return <ProtectedPage role="seller">{() => <SellerOrdersContent />}</ProtectedPage>;
}
