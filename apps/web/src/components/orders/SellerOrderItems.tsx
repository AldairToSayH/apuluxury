import Link from "next/link";

import type { SellerOrderDetail } from "@/types/api";

type SellerOrderItemsProps = {
  sellerOrder: SellerOrderDetail;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export function SellerOrderItems({ sellerOrder }: SellerOrderItemsProps) {
  return (
    <section className="rounded-md bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-ink">Productos</h2>
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
            <span className="text-sm text-ink/70">{formatMoney(item.unitPrice)}</span>
            <span className="text-sm text-ink/70">Cantidad {item.quantity}</span>
            <span className="font-bold text-copper">{formatMoney(item.subtotal)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
