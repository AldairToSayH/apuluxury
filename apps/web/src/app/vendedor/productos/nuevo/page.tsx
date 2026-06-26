"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductForm } from "@/components/seller/ProductForm";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { createSellerProduct, getCategories } from "@/lib/sellerApi";
import type { Category, ProductFormValues } from "@/types/api";

export default function NewSellerProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.categories))
      .catch(() => setError("No se pudieron cargar las categorías"));
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    const token = getToken();

    if (!token) {
      return;
    }

    setError("");

    try {
      await createSellerProduct(token, values);
      router.replace("/vendedor/productos");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo crear el producto",
      );
    }
  }

  return (
    <ProtectedPage role="seller">
      {(session) => (
        <section className="mx-auto max-w-5xl px-6 py-12">
          <Link className="text-sm font-bold text-mineral" href="/vendedor/productos">
            Volver a productos
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-ink">Crear producto</h1>
          {session.seller?.validationStatus !== "approved" && (
            <p className="mt-6 rounded-md bg-maize/30 p-4 font-medium text-ink">
              Tu cuenta de vendedor no está aprobada. El backend puede bloquear la creación.
            </p>
          )}
          {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="mt-8">
            <ProductForm
              allowedStatuses={["draft", "active"]}
              categories={categories}
              onSubmit={handleSubmit}
              submitLabel="Crear producto"
            />
          </div>
        </section>
      )}
    </ProtectedPage>
  );
}
