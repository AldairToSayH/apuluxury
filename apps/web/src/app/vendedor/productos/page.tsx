"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { SellerProductTable } from "@/components/seller/SellerProductTable";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getCategories,
  getSellerProducts,
  type SellerProductFilters,
} from "@/lib/sellerApi";
import type { Category, SellerProduct } from "@/types/api";

export default function SellerProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [filters, setFilters] = useState<SellerProductFilters>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadProducts(nextFilters = filters) {
    const token = getToken();

    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        getCategories(),
        getSellerProducts(token, nextFilters),
      ]);

      setCategories(categoriesResponse.categories);
      setProducts(productsResponse.products);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudieron cargar los productos",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productCountLabel = useMemo(
    () => `${products.length} producto${products.length === 1 ? "" : "s"}`,
    [products.length],
  );

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextFilters = {
      search: String(formData.get("search") ?? "").trim() || undefined,
      status: String(formData.get("status") ?? "") as SellerProductFilters["status"],
      category_id: String(formData.get("category_id") ?? "").trim() || undefined,
    };

    setFilters(nextFilters);
    loadProducts(nextFilters);
  }

  return (
    <ProtectedPage role="seller">
      {(session) => (
        <section className="site-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Vendedor</p>
              <h1 className="mt-3 text-4xl font-black text-ink">Mis productos</h1>
              <p className="mt-2 text-ink/60">{productCountLabel}</p>
            </div>
            <Link
              className="primary-action"
              href="/vendedor/productos/nuevo"
            >
              Crear producto
            </Link>
          </div>

          {session.seller?.validationStatus !== "approved" && (
            <p className="mt-6 rounded-md bg-maize/30 p-4 font-medium text-ink">
              Tu cuenta de vendedor no está aprobada. La creación o edición puede ser bloqueada por el backend.
            </p>
          )}

          <form className="luxury-card mt-8 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]" onSubmit={handleFilter}>
            <input className="form-field" name="search" placeholder="Buscar por nombre de producto" />
            <select className="form-field" name="status" defaultValue="">
              <option value="">Todos</option>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="rejected">Rechazado</option>
            </select>
            <select className="form-field" name="category_id" defaultValue="">
              <option value="">Categoría</option>
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

          {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}

          <div className="mt-8">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-white shadow-soft" />
            ) : products.length === 0 ? (
              <div className="rounded-md bg-white p-8 text-center shadow-soft">
                <h2 className="text-xl font-bold text-ink">Aún no tienes productos</h2>
                <p className="mt-2 text-ink/60">Crea tu primer producto para empezar a vender.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <SellerProductTable products={products} categories={categories} />
              </div>
            )}
          </div>
        </section>
      )}
    </ProtectedPage>
  );
}
