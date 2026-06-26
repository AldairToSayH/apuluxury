"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductImageForm } from "@/components/seller/ProductImageForm";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  addProductImage,
  deleteProductImage,
  getProductImages,
  getSellerProduct,
  setProductImageMain,
  type ProductImageValues,
} from "@/lib/sellerApi";
import type { ProductImage, SellerProduct } from "@/types/api";

export default function ProductImagesPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadImages() {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    setIsLoading(true);

    try {
      const [productResponse, imagesResponse] = await Promise.all([
        getSellerProduct(token, params.id),
        getProductImages(token, params.id),
      ]);

      setProduct(productResponse.product);
      setImages(imagesResponse.images);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudieron cargar las imágenes",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleAdd(values: ProductImageValues) {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await addProductImage(token, params.id, values);
      setMessage("Imagen agregada.");
      await loadImages();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo agregar la imagen",
      );
    }
  }

  async function handleMain(imageId: string) {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    await setProductImageMain(token, params.id, imageId);
    setMessage("Imagen principal actualizada.");
    await loadImages();
  }

  async function handleDelete(imageId: string) {
    const token = getToken();

    if (!token || !params.id) {
      return;
    }

    await deleteProductImage(token, params.id, imageId);
    setMessage("Imagen eliminada.");
    await loadImages();
  }

  return (
    <ProtectedPage role="seller">
      {() => (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <Link className="text-sm font-bold text-mineral" href={`/vendedor/productos/${params.id}`}>
            Volver al producto
          </Link>
          <h1 className="mt-4 text-4xl font-bold text-ink">Gestionar imágenes</h1>
          {product && <p className="mt-2 text-ink/60">{product.name}</p>}
          {message && <p className="mt-6 rounded-md bg-mineral/10 p-4 text-mineral">{message}</p>}
          {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
          <div className="mt-8">
            <ProductImageForm onSubmit={handleAdd} />
          </div>
          <div className="mt-8">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-white shadow-soft" />
            ) : images.length === 0 ? (
              <div className="rounded-md bg-white p-8 text-center shadow-soft">
                <h2 className="text-xl font-bold">Sin imágenes</h2>
                <p className="mt-2 text-ink/60">Agrega una URL pública para mostrar el producto.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <article className="overflow-hidden rounded-md bg-white shadow-soft" key={image.id}>
                    <img alt={image.altText ?? "Producto"} className="h-64 w-full object-cover" src={image.imageUrl} />
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-ink/70">{image.altText ?? "Sin texto descriptivo"}</p>
                        {image.isMain && <span className="rounded-full bg-mineral/10 px-3 py-1 text-xs font-bold text-mineral">Principal</span>}
                      </div>
                      <p className="text-sm text-ink/60">Posición {image.position}</p>
                      <div className="flex flex-wrap gap-2 text-sm font-bold">
                        <button className="rounded-full border border-ink/15 px-4 py-2" type="button" onClick={() => handleMain(image.id)}>
                          Hacer principal
                        </button>
                        <button className="rounded-full bg-red-700 px-4 py-2 text-white" type="button" onClick={() => handleDelete(image.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </ProtectedPage>
  );
}
