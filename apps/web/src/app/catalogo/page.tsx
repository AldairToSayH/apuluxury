"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ProductImage } from "@/components/products/ProductImage";
import { ApiError, apiClient } from "@/lib/apiClient";
import { routes } from "@/lib/routes";
import type { CatalogProduct } from "@/types/api";

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const query = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    apiClient<{ products: CatalogProduct[] }>("/api/catalog/products")
      .then((response) => setProducts(response.products))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el catalogo",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const normalizedQuery = query.toLowerCase();
  const visibleProducts = normalizedQuery
    ? products.filter((product) =>
        [
          product.name,
          product.categoryName,
          product.commercialName,
          product.description ?? "",
          product.material ?? "",
          product.color ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : products;

  return (
    <section className="site-shell">
      <div className="mb-9 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="section-heading">
          <p className="eyebrow">Catalogo</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
            Piezas artesanales listas para descubrir
          </h1>
          <p className="mt-4 text-ink/64">
            Moda andina, textiles, accesorios y objetos hechos por vendedores
            aprobados de APU LUXURY.
          </p>
        </div>
        <p className="premium-surface px-4 py-3 text-sm font-bold text-ink/66">
          {visibleProducts.length} producto{visibleProducts.length === 1 ? "" : "s"}
        </p>
      </div>

      <form className="luxury-card mb-8 flex flex-col gap-3 p-4 sm:flex-row" action={routes.catalog}>
        <input
          className="form-field"
          defaultValue={query}
          name="q"
          placeholder="Busca chalina negra, poncho, alpaca..."
          type="search"
        />
        <button className="primary-action" type="submit">
          Buscar prendas
        </button>
        {query && (
          <Link className="secondary-action" href={routes.catalog}>
            Limpiar
          </Link>
        )}
      </form>

      {error && <p className="rounded-md bg-red-50 p-4 text-red-700">{error}</p>}

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <h2 className="text-2xl font-black text-ink">
            {query ? "No encontramos prendas con esa busqueda" : "No hay productos activos"}
          </h2>
          <p className="mt-2 text-ink/60">
            {query
              ? "Prueba con otro termino, por ejemplo alpaca, poncho o chalina."
              : "Vuelve pronto para ver nuevas piezas."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <Link
              href={`/producto/${product.slug}`}
              key={product.id}
              className="group overflow-hidden rounded-md border border-white/70 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,20,18,0.16)]"
            >
              <div className="relative overflow-hidden">
                <ProductImage
                  alt={product.name}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.mainImageUrl}
                />
              </div>
              <div className="space-y-3 p-5">
                <p className="ui-font text-xs font-black uppercase tracking-[0.16em] text-mineral">
                  {product.categoryName}
                </p>
                <h2 className="text-xl font-black leading-tight text-ink">
                  {product.name}
                </h2>
                <p className="ui-font text-2xl font-black text-copper">
                  S/ {product.price.toFixed(2)}
                </p>
                <p className="text-sm text-ink/58">Por {product.commercialName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <section className="site-shell">
          <div className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
        </section>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
