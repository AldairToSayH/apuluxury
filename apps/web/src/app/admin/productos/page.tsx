"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getAdminProducts,
  updateAdminProductStatus,
  type AdminProductFilters,
} from "@/lib/adminProductsApi";
import { getCategories } from "@/lib/sellerApi";
import type { AdminProduct, Category, ProductStatus } from "@/types/api";

const statusOptions: Array<{ value: ""; label: string } | { value: ProductStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "rejected", label: "Rechazado" },
];

function AdminProductsContent() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<AdminProductFilters>({});
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = (nextFilters: AdminProductFilters = filters) => {
    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    Promise.all([getAdminProducts(token, nextFilters), getCategories()])
      .then(([productsResponse, categoriesResponse]) => {
        setProducts(productsResponse.products);
        setCategories(categoriesResponse.categories);
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar los productos",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProducts({});
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status") ?? "") as ProductStatus | "";
    const search = String(form.get("search") ?? "").trim();
    const categoryId = String(form.get("category_id") ?? "");
    const nextFilters: AdminProductFilters = {};

    if (status) {
      nextFilters.status = status;
    }

    if (search) {
      nextFilters.search = search;
    }

    if (categoryId) {
      nextFilters.category_id = categoryId;
    }

    setFilters(nextFilters);
    loadProducts(nextFilters);
  };

  const handleStatusUpdate = async (id: string, status: ProductStatus) => {
    if (!window.confirm("Quieres cambiar el estado de este producto?")) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      return;
    }

    setBusyProductId(id);
    setError("");
    setSuccess("");

    try {
      await updateAdminProductStatus(token, id, status);
      setSuccess("Producto actualizado.");
      loadProducts(filters);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el producto",
      );
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <section className="site-shell">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black text-ink">Productos</h1>
          <p className="mt-2 text-ink/65">Modera productos del marketplace.</p>
        </div>
        <Link className="secondary-action" href="/admin">
          Volver al panel
        </Link>
      </div>

      <form
        className="luxury-card mb-6 grid gap-3 p-4 md:grid-cols-[12rem_1fr_14rem_auto]"
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
          placeholder="Buscar producto o vendedor"
          defaultValue={filters.search ?? ""}
        />
        <select
          className="form-field"
          name="category_id"
          defaultValue={filters.category_id ?? ""}
        >
          <option value="">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="primary-action" type="submit">
          Filtrar
        </button>
      </form>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
      ) : products.length === 0 ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-ink">No hay productos</h2>
        </div>
      ) : (
        <AdminProductTable
          products={products}
          busyProductId={busyProductId}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </section>
  );
}

export default function AdminProductsPage() {
  return <ProtectedPage role="admin">{() => <AdminProductsContent />}</ProtectedPage>;
}
