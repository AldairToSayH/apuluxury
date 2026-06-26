"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AdminSellerCard } from "@/components/admin/AdminSellerCard";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  approveSeller,
  getAdminSellers,
  rejectSeller,
  suspendSeller,
  type AdminSellerFilters,
} from "@/lib/adminSellersApi";
import type { AdminSeller, SellerValidationStatus } from "@/types/api";

const statuses: Array<{ value: ""; label: string } | { value: SellerValidationStatus; label: string }> = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "suspended", label: "Suspendido" },
];

function AdminSellersContent() {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [filters, setFilters] = useState<AdminSellerFilters>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSellers = (nextFilters: AdminSellerFilters = filters) => {
    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    getAdminSellers(token, nextFilters)
      .then((response) => setSellers(response.sellers))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar los vendedores",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSellers({});
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validationStatus = String(form.get("validation_status") ?? "") as
      | SellerValidationStatus
      | "";
    const search = String(form.get("search") ?? "").trim();
    const nextFilters: AdminSellerFilters = {};

    if (validationStatus) {
      nextFilters.validation_status = validationStatus;
    }

    if (search) {
      nextFilters.search = search;
    }

    setFilters(nextFilters);
    loadSellers(nextFilters);
  };

  const handleAction = async (id: string, action: SellerValidationStatus) => {
    if (!window.confirm("Quieres aplicar esta accion al vendedor?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      return;
    }

    setBusyAction(`${id}:${action}`);
    setError("");
    setSuccess("");

    try {
      if (action === "approved") {
        await approveSeller(token, id);
      } else if (action === "rejected") {
        await rejectSeller(token, id);
      } else if (action === "suspended") {
        await suspendSeller(token, id);
      }

      setSuccess("Vendedor actualizado.");
      loadSellers(filters);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el vendedor",
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Vendedores</h1>
          <p className="mt-2 text-ink/65">Gestiona validacion de vendedores.</p>
        </div>
        <Link className="secondary-action" href="/admin">
          Volver al panel
        </Link>
      </div>

      <form
        className="luxury-card mb-6 grid gap-3 p-4 md:grid-cols-[12rem_1fr_auto]"
        onSubmit={handleSubmit}
      >
        <select className="form-field" name="validation_status" defaultValue={filters.validation_status ?? ""}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <input
          className="form-field"
          name="search"
          placeholder="Buscar por nombre o correo"
          defaultValue={filters.search ?? ""}
        />
        <button className="primary-action" type="submit">
          Filtrar
        </button>
      </form>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div className="h-36 animate-pulse rounded-md bg-white shadow-soft" key={item} />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <div className="empty-state">
          <h2 className="text-2xl font-black text-ink">No hay vendedores</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller) => (
            <AdminSellerCard
              key={seller.id}
              seller={seller}
              busyAction={busyAction}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminSellersPage() {
  return <ProtectedPage role="admin">{() => <AdminSellersContent />}</ProtectedPage>;
}
