import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { OrderDetail } from "@/types/api";

type BuyerOrderItemsProps = {
  order: OrderDetail;
};

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`;
}

export function BuyerOrderItems({ order }: BuyerOrderItemsProps) {
  return (
    <div className="space-y-5">
      {order.sellerOrders.map((sellerOrder) => (
        <section className="rounded-md bg-white p-6 shadow-soft" key={sellerOrder.id}>
          <div className="flex flex-col gap-3 border-b border-ink/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {sellerOrder.sellerCommercialName ?? "Vendedor"}
              </h2>
              <p className="text-sm text-ink/60">
                Subtotal {formatMoney(sellerOrder.subtotalAmount, order.currency)}
              </p>
            </div>
            <OrderStatusBadge status={sellerOrder.status} />
          </div>

          <div className="mt-4 divide-y divide-ink/10">
            {sellerOrder.items.map((item) => (
              <div
                className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto_auto]"
                key={item.id}
              >
                <div>
                  {item.productSlug ? (
                    <Link
                      className="font-bold text-ink hover:text-mineral"
                      href={`/producto/${item.productSlug}`}
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-bold text-ink">{item.productName}</p>
                  )}
                </div>
                <span className="text-sm text-ink/70">
                  {formatMoney(item.unitPrice, order.currency)}
                </span>
                <span className="text-sm text-ink/70">Cantidad {item.quantity}</span>
                <span className="font-bold text-copper">
                  {formatMoney(item.subtotal, order.currency)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
