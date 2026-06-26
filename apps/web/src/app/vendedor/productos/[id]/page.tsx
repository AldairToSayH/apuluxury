"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductImage } from "@/components/products/ProductImage";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getCategories, getSellerProduct } from "@/lib/sellerApi";
import type { Category, SellerProduct } from "@/types/api";

export default function SellerProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    Promise.all([getSellerProduct(token, params.id), getCategories()])
      .then(([productResponse, categoriesResponse]) => {
        setProduct(productResponse.product);
        setCategories(categoriesResponse.categories);
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el producto",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const category = categories.find((item) => item.id === product?.categoryId);

  return (
    <ProtectedPage role="seller">
      {() => (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <Link className="text-sm font-bold text-mineral" href="/vendedor/productos">
            Volver a productos
          </Link>
          {isLoading ? (
            <div className="mt-8 h-80 animate-pulse rounded-md bg-white shadow-soft" />
          ) : error || !product ? (
            <p className="mt-8 rounded-md bg-red-50 p-4 text-red-700">
              {error || "Producto no encontrado"}
            </p>
          ) : (
            <div className="mt-8 grid gap-6 rounded-md bg-white p-6 shadow-soft md:grid-cols-[16rem_1fr]">
              <ProductImage
                alt={product.name}
                className="aspect-square w-full rounded-md object-cover"
                sizes="(min-width: 768px) 16rem, 100vw"
              />
              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-ink">{product.name}</h1>
                    <p className="mt-2 text-ink/60">{product.slug}</p>
                  </div>
                  <ProductStatusBadge status={product.status} />
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-md bg-cloud p-4">
                    <p className="text-xs uppercase text-ink/50">Precio</p>
                    <p className="mt-1 text-xl font-bold">S/ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="rounded-md bg-cloud p-4">
                    <p className="text-xs uppercase text-ink/50">Stock</p>
                    <p className="mt-1 text-xl font-bold">{product.stock}</p>
                  </div>
                  <div className="rounded-md bg-cloud p-4">
                    <p className="text-xs uppercase text-ink/50">Categoria</p>
                    <p className="mt-1 text-xl font-bold">
                      {category?.name ?? product.categoryId}
                    </p>
                  </div>
                </div>
                <p className="mt-8 leading-8 text-ink/70">{product.description}</p>
                <div className="mt-8 flex flex-wrap gap-3 font-bold">
                  <Link
                    className="rounded-full bg-ink px-5 py-3 text-white"
                    href={`/vendedor/productos/${product.id}/editar`}
                  >
                    Editar producto
                  </Link>
                  <Link
                    className="rounded-full border border-ink/15 px-5 py-3"
                    href={`/vendedor/productos/${product.id}/imagenes`}
                  >
                    Gestionar imagenes
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </ProtectedPage>
  );
}
