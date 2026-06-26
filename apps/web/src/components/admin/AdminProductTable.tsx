import Link from "next/link";

import { AdminProductStatusActions } from "@/components/admin/AdminProductStatusActions";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import type { AdminProduct, ProductStatus } from "@/types/api";

type AdminProductTableProps = {
  products: AdminProduct[];
  busyProductId: string | null;
  onStatusUpdate: (id: string, status: ProductStatus) => void;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function AdminProductTable({
  products,
  busyProductId,
  onStatusUpdate,
}: AdminProductTableProps) {
  return (
    <div className="table-shell">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="bg-cloud text-xs uppercase tracking-[0.08em] text-ink/60">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Vendedor</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Creado</th>
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
                    className="size-14 rounded-md object-cover"
                    sizes="56px"
                    src={product.mainImageUrl}
                  />
                  <div>
                    <p className="font-bold text-ink">{product.name}</p>
                    <p className="text-xs text-ink/50">{product.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">{product.commercialName}</td>
              <td className="px-4 py-4">{product.categoryName}</td>
              <td className="px-4 py-4 font-bold text-copper">{formatMoney(product.price)}</td>
              <td className="px-4 py-4">{product.stock}</td>
              <td className="px-4 py-4">
                <ProductStatusBadge status={product.status} />
              </td>
              <td className="px-4 py-4">{formatDate(product.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="space-y-3">
                  <Link
                    className="font-bold text-mineral"
                    href={`/admin/productos/${product.id}`}
                  >
                    Ver detalle
                  </Link>
                  <AdminProductStatusActions
                    currentStatus={product.status}
                    isUpdating={busyProductId === product.id}
                    onUpdate={(status) => onStatusUpdate(product.id, status)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
