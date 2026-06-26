import Link from "next/link";

import { ProductImage } from "@/components/products/ProductImage";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import type { Category, SellerProduct } from "@/types/api";

type SellerProductTableProps = {
  products: SellerProduct[];
  categories: Category[];
};

export function SellerProductTable({
  products,
  categories,
}: SellerProductTableProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <div className="table-shell">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-cloud text-xs uppercase tracking-[0.08em] text-ink/60">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr className="border-t border-ink/10" key={product.id}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <ProductImage
                    alt={product.name}
                    className="size-12 rounded-md object-cover"
                    sizes="48px"
                  />
                  <span className="font-bold text-ink">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-ink/65">
                {categoryById.get(product.categoryId)?.name ?? product.categoryId}
              </td>
              <td className="px-4 py-4 font-bold text-copper">S/ {product.price.toFixed(2)}</td>
              <td className="px-4 py-4">{product.stock}</td>
              <td className="px-4 py-4">
                <ProductStatusBadge status={product.status} />
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2 font-bold">
                  <Link href={`/vendedor/productos/${product.id}`} className="text-mineral">
                    Ver
                  </Link>
                  <Link href={`/vendedor/productos/${product.id}/editar`} className="text-copper">
                    Editar
                  </Link>
                  <Link href={`/vendedor/productos/${product.id}/imagenes`} className="text-ink">
                    Imagenes
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
