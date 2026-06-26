"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductForm } from "@/components/seller/ProductForm";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getCategories,
  getSellerProduct,
  updateSellerProduct,
} from "@/lib/sellerApi";
import type { Category, ProductFormValues, SellerProduct } from "@/types/api";

export default function EditSellerProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
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

  async function handleSubmit(values: ProductFormValues) {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await updateSellerProduct(token, params.id, values);
      setProduct(response.product);
      setMessage("Producto actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el producto",
      );
    }
  }

  return (
    <ProtectedPage role="seller">
      {() => (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <Link className="text-sm font-bold text-mineral" href={`/vendedor/productos/${params.id}`}>
            Volver al producto
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-ink">Editar producto</h1>
          {message && <p className="mt-6 rounded-md bg-mineral/10 p-4 text-mineral">{message}</p>}
          {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
          {isLoading ? (
            <div className="mt-8 h-96 animate-pulse rounded-md bg-white shadow-soft" />
          ) : product ? (
            <div className="mt-8">
              <ProductForm
                allowedStatuses={["draft", "active", "inactive"]}
                categories={categories}
                initialProduct={product}
                onSubmit={handleSubmit}
                submitLabel="Guardar cambios"
              />
            </div>
          ) : null}
        </section>
      )}
    </ProtectedPage>
  );
}
