"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { StoreCard } from "@/components/stores/StoreCard";
import { StoreCarousel } from "@/components/stores/StoreCarousel";
import { ApiError } from "@/lib/apiClient";
import { routes } from "@/lib/routes";
import { getStores } from "@/lib/storesApi";
import type { PublicStore } from "@/types/api";

function StoresContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    getStores(query ? { search: query } : {})
      .then((response) => setStores(response.stores))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudieron cargar las tiendas",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [query]);

  return (
    <section className="site-shell">
      <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="section-heading">
          <p className="eyebrow">Ver tiendas</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
            Tiendas artesanales
          </h1>
          <p className="mt-4 text-ink/64">
            Explora vendedores seleccionados y descubre piezas con origen,
            textura y caracter.
          </p>
        </div>
        <p className="premium-surface px-4 py-3 text-sm font-bold text-ink/66">
          {stores.length} tienda{stores.length === 1 ? "" : "s"}
        </p>
      </div>

      <form
        className="luxury-card mb-10 flex flex-col gap-3 p-4 sm:flex-row"
        action={routes.stores}
      >
        <input
          className="form-field"
          defaultValue={query}
          name="q"
          placeholder="Busca por tienda, tecnica o propuesta artesanal"
          type="search"
        />
        <button className="primary-action" type="submit">
          Buscar tiendas
        </button>
        {query && (
          <Link className="secondary-action" href={routes.stores}>
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
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <h2 className="text-2xl font-black text-ink">
            {query ? "No encontramos tiendas con esa busqueda" : "Aun no hay tiendas aprobadas"}
          </h2>
          <p className="mt-2 text-ink/60">
            {query
              ? "Prueba con otro termino o explora el catalogo completo."
              : "Cuando los vendedores sean aprobados apareceran aqui."}
          </p>
        </div>
      ) : (
        <>
          <section className="mb-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Rotacion diaria</p>
                <h2 className="mt-2 text-3xl font-black text-ink">
                  Descubre tiendas seleccionadas
                </h2>
              </div>
            </div>
            <StoreCarousel stores={stores} />
          </section>

          <section>
            <div className="mb-5">
              <p className="eyebrow">Directorio</p>
              <h2 className="mt-2 text-3xl font-black text-ink">
                Todas las tiendas
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <section className="site-shell">
          <div className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
        </section>
      }
    >
      <StoresContent />
    </Suspense>
  );
}
