import Link from "next/link";

import { ProductImage } from "@/components/products/ProductImage";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import type { Category, SellerProduct } from "@/types/api";

type SellerProductCardProps = {
  product: SellerProduct;
  category?: Category;
};

export function SellerProductCard({ product, category }: SellerProductCardProps) {
  return (
    <article className="overflow-hidden rounded-md bg-white shadow-soft">
      <ProductImage
        alt={product.name}
        className="h-44 w-full object-cover"
        sizes="(min-width: 768px) 33vw, 100vw"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">{product.name}</h2>
            <p className="mt-1 text-sm text-ink/60">
              {category?.name ?? product.categoryId}
            </p>
          </div>
          <ProductStatusBadge status={product.status} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <span className="rounded-md bg-cloud p-3">S/ {product.price.toFixed(2)}</span>
          <span className="rounded-md bg-cloud p-3">Stock {product.stock}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          <Link
            className="rounded-full bg-ink px-4 py-2 text-white"
            href={`/vendedor/productos/${product.id}`}
          >
            Ver
          </Link>
          <Link
            className="rounded-full border border-ink/15 px-4 py-2"
            href={`/vendedor/productos/${product.id}/editar`}
          >
            Editar
          </Link>
          <Link
            className="rounded-full border border-ink/15 px-4 py-2"
            href={`/vendedor/productos/${product.id}/imagenes`}
          >
            Imagenes
          </Link>
        </div>
      </div>
    </article>
  );
}
