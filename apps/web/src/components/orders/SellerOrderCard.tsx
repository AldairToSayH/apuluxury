import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { SellerOrderSummary } from "@/types/api";

type SellerOrderCardProps = {
  sellerOrder: SellerOrderSummary;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SellerOrderCard({ sellerOrder }: SellerOrderCardProps) {
  return (
    <article className="rounded-md bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-ink">
              {sellerOrder.orderCode ?? sellerOrder.id}
            </h2>
            <OrderStatusBadge status={sellerOrder.status} />
          </div>
          <p className="mt-2 text-sm text-ink/60">{formatDate(sellerOrder.createdAt)}</p>
          <p className="mt-3 text-sm text-ink/70">Seller order: {sellerOrder.id}</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <p className="text-lg font-bold text-copper">
            {formatMoney(sellerOrder.subtotalAmount)}
          </p>
          <Link
            className="rounded-full bg-mineral px-5 py-2 text-sm font-bold text-white"
            href={`/vendedor/pedidos/${sellerOrder.id}`}
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
