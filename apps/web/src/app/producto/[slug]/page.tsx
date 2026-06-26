"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductImage } from "@/components/products/ProductImage";
import { ApiError, apiClient } from "@/lib/apiClient";
import type { CatalogProductDetail } from "@/types/api";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) {
      return;
    }

    apiClient<{ product: CatalogProductDetail }>(
      `/api/catalog/products/${params.slug}`,
    )
      .then((response) => setProduct(response.product))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el producto",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (isLoading) {
    return (
      <section className="site-shell">
        <div className="h-[34rem] animate-pulse rounded-md bg-white shadow-soft" />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="rounded-md bg-red-50 p-4 text-red-700">
          {error || "Producto no encontrado"}
        </p>
      </section>
    );
  }

  const primaryImage = product.images[0]?.imageUrl ?? product.mainImageUrl;

  return (
    <section className="site-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <ProductImage
          alt={product.name}
          className="aspect-[4/5] w-full rounded-md object-cover shadow-soft"
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          src={primaryImage}
        />
        {product.images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((image) => (
              <ProductImage
                alt={image.altText ?? product.name}
                className="aspect-square rounded-md object-cover"
                key={image.id}
                sizes="25vw"
                src={image.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
      <div className="self-center">
        <p className="eyebrow">{product.categoryName}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-5 ui-font text-3xl font-black text-copper">
          S/ {product.price.toFixed(2)}
        </p>
        <p className="mt-6 leading-8 text-ink/70">{product.description}</p>
        <div className="mt-7 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
          <span className="premium-surface p-4">Vendedor: {product.commercialName}</span>
          <span className="premium-surface p-4">Stock disponible: {product.stock}</span>
          {product.material && (
            <span className="premium-surface p-4">Material: {product.material}</span>
          )}
          {product.color && (
            <span className="premium-surface p-4">Color: {product.color}</span>
          )}
        </div>
        <AddToCartButton productId={product.id} stock={product.stock} />
      </div>
    </section>
  );
}
