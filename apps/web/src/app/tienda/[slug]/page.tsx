"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StoreProductGrid } from "@/components/stores/StoreProductGrid";
import { ApiError } from "@/lib/apiClient";
import { getStoreDetail } from "@/lib/storesApi";
import type { PublicStoreDetail } from "@/types/api";

export default function StoreDetailPage() {
  const params = useParams<{ slug: string }>();
  const [store, setStore] = useState<PublicStoreDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) {
      return;
    }

    setIsLoading(true);
    setError("");

    getStoreDetail(params.slug)
      .then((response) => setStore(response.store))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar la tienda",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (isLoading) {
    return (
      <section className="site-shell">
        <div className="h-[32rem] animate-pulse rounded-md bg-white shadow-soft" />
      </section>
    );
  }

  if (error || !store) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="rounded-md bg-red-50 p-4 text-red-700">
          {error || "Tienda no encontrada"}
        </p>
      </section>
    );
  }

  return (
    <section className="site-shell">
      <Link className="font-bold text-mineral hover:text-ink" href="/tiendas">
        Volver a tiendas
      </Link>

      <div className="mt-8 overflow-hidden rounded-md bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-maize">
              Tienda artesanal
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              {store.commercialName}
            </h1>
            <p className="mt-2 text-sm font-bold text-maize">
              {store.subdomain}.apuluxury.com
            </p>
            <p className="mt-5 max-w-3xl leading-8 text-white/70">
              {store.businessDescription ??
                "Una tienda seleccionada por APU LUXURY con piezas artesanales de origen."}
            </p>
          </div>

          <div className="grid gap-3 rounded-md border border-white/10 bg-white/[0.06] p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">
                Productos activos
              </p>
              <p className="mt-1 text-3xl font-black text-maize">
                {store.productCount}
              </p>
            </div>
            {store.phone && (
              <a
                className="rounded-full bg-maize px-5 py-3 text-center text-sm font-black text-ink transition hover:bg-white"
                href={`tel:${store.phone}`}
              >
                Contactar tienda: {store.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-6">
          <p className="eyebrow">Catalogo de tienda</p>
          <h2 className="mt-2 text-3xl font-black text-ink">
            Piezas disponibles
          </h2>
        </div>
        <StoreProductGrid products={store.products} />
      </div>
    </section>
  );
}
