"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminProductStatusActions } from "@/components/admin/AdminProductStatusActions";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import {
  getAdminProductDetail,
  updateAdminProductStatus,
} from "@/lib/adminProductsApi";
import { getToken } from "@/lib/auth";
import type { AdminProductDetail, ProductStatus } from "@/types/api";

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminProductDetailContent() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadProduct = () => {
    const token = getToken();

    if (!token || !params.id) {
      setError("No se pudo cargar el producto.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    getAdminProductDetail(token, params.id)
      .then((response) => setProduct(response.product))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el producto",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const handleStatusUpdate = async (status: ProductStatus) => {
    if (!window.confirm("Quieres cambiar el estado de este producto?")) {
      return;
    }

    const token = getToken();

    if (!token || !params.id) {
      setError("No se pudo actualizar el producto.");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateAdminProductStatus(token, params.id, status);
      setProduct(response.product);
      setSuccess("Producto actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el producto",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link className="font-bold text-mineral hover:text-ink" href="/admin/productos">
          Volver a productos
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="space-y-5">
          <div className="h-72 animate-pulse rounded-md bg-white shadow-soft" />
          <div className="h-40 animate-pulse rounded-md bg-white shadow-soft" />
        </div>
      ) : !product ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-ink">Producto no encontrado</h1>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 rounded-md bg-white p-6 shadow-soft lg:grid-cols-[18rem_1fr]">
            <ProductImage
              alt={product.name}
              className="aspect-square w-full rounded-md object-cover"
              sizes="(min-width: 1024px) 18rem, 100vw"
              src={product.mainImageUrl}
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-ink">{product.name}</h1>
                <ProductStatusBadge status={product.status} />
              </div>
              <p className="mt-2 text-sm text-ink/60">{product.slug}</p>
              <p className="mt-5 text-2xl font-bold text-copper">
                {formatMoney(product.price)}
              </p>
              <p className="mt-4 text-ink/70">{product.description}</p>
              <div className="mt-5 grid gap-2 text-sm text-ink/70 md:grid-cols-2">
                <span>Stock: {product.stock}</span>
                <span>Categoria: {product.categoryName}</span>
                <span>Vendedor: {product.commercialName}</span>
                <span>Seller status: {product.sellerValidationStatus}</span>
                <span>Creado: {formatDate(product.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-ink">Moderacion</h2>
            <div className="mt-4">
              <AdminProductStatusActions
                currentStatus={product.status}
                isUpdating={isUpdating}
                onUpdate={handleStatusUpdate}
              />
            </div>
          </div>

          <div className="rounded-md bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-ink">Imagenes</h2>
            {product.images.length === 0 ? (
              <div className="mt-4 max-w-xs">
                <ProductImage
                  alt={product.name}
                  className="aspect-square w-full rounded-md object-cover"
                  sizes="20rem"
                />
                <p className="mt-3 text-sm text-ink/60">
                  Este producto no tiene imagenes cargadas.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.images.map((image) => (
                  <div key={image.id}>
                    <ProductImage
                      alt={image.altText ?? product.name}
                      className="aspect-square w-full rounded-md object-cover"
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      src={image.imageUrl}
                    />
                    <p className="mt-2 text-xs text-ink/60">
                      Posicion {image.position} {image.isMain ? "principal" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AdminProductDetailPage() {
  return <ProtectedPage role="admin">{() => <AdminProductDetailContent />}</ProtectedPage>;
}
