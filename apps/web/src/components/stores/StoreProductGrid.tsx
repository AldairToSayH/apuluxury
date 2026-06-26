import Link from "next/link";

import { ProductImage } from "@/components/products/ProductImage";
import type { PublicStoreProduct } from "@/types/api";

type StoreProductGridProps = {
  products: PublicStoreProduct[];
};

export function StoreProductGrid({ products }: StoreProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="text-2xl font-black text-ink">Sin productos activos</h2>
        <p className="mt-2 text-ink/60">
          Esta tienda aun no tiene piezas disponibles en catalogo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          className="group overflow-hidden rounded-md border border-white/70 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,20,18,0.16)]"
          href={`/producto/${product.slug}`}
          key={product.id}
        >
          <ProductImage
            alt={product.name}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            src={product.mainImageUrl}
          />
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
            <p className="text-sm text-ink/58">
              Stock disponible: {product.stock}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
