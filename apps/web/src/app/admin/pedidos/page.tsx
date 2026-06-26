"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AdminOrderCard } from "@/components/admin/AdminOrderCard";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getAdminOrders, type AdminOrderFilters } from "@/lib/adminOrdersApi";
import type { OrderStatus, OrderSummary } from "@/types/api";

const statusOptions: Array<{ value: ""; label: string } | { value: OrderStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "completed", label: "Completado" },
];

function AdminOrdersContent() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filters, setFilters] = useState<AdminOrderFilters>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = (nextFilters: AdminOrderFilters = filters) => {
    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    getAdminOrders(token, nextFilters)
      .then((response) => setOrders(response.orders))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar los pedidos",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders({});
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status") ?? "") as OrderStatus | "";
    const search = String(form.get("search") ?? "").trim();
    const from = String(form.get("from") ?? "");
    const to = String(form.get("to") ?? "");
    const nextFilters: AdminOrderFilters = {};

    if (status) {
      nextFilters.status = status;
    }

    if (search) {
      nextFilters.search = search;
    }

    if (from) {
      nextFilters.from = from;
    }

    if (to) {
      nextFilters.to = to;
    }

    setFilters(nextFilters);
    loadOrders(nextFilters);
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Pedidos</h1>
          <p className="mt-2 text-ink/65">Consulta pedidos globales del marketplace.</p>
        </div>
        <Link className="secondary-action" href="/admin">
          Volver al panel
        </Link>
      </div>

      <form
        className="luxury-card mb-6 grid gap-3 p-4 md:grid-cols-[12rem_1fr_10rem_10rem_auto]"
        onSubmit={handleSubmit}
      >
        <select
          className="form-field"
          name="status"
          defaultValue={filters.status ?? ""}
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <input
          className="form-field"
          name="search"
          placeholder="Buscar por codigo de pedido"
          defaultValue={filters.search ?? ""}
        />
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
            <div className="h-36 animate-pulse rounded-md bg-white shadow-soft" key={item} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-ink">No hay pedidos</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminOrdersPage() {
  return <ProtectedPage role="admin">{() => <AdminOrdersContent />}</ProtectedPage>;
}
