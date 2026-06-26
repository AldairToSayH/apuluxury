import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { OrderSummary } from "@/types/api";

type AdminOrderCardProps = {
  order: OrderSummary;
};

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminOrderCard({ order }: AdminOrderCardProps) {
  return (
    <article className="rounded-md bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-ink">{order.orderCode}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-ink/60">{formatDate(order.createdAt)}</p>
          <div className="mt-4 grid gap-1 text-sm text-ink/70">
            <span>Comprador: {order.buyerEmail ?? order.buyerId}</span>
            <span>Seller orders: {order.sellerOrders?.length ?? 0}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <p className="text-lg font-bold text-copper">
            {formatMoney(order.totalAmount, order.currency)}
          </p>
          <Link
            className="rounded-full bg-mineral px-5 py-2 text-sm font-bold text-white"
            href={`/admin/pedidos/${order.id}`}
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
