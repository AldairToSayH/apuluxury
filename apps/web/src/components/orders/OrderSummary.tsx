import type { Cart } from "@/types/api";

type OrderSummaryProps = {
  cart: Cart;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  const totalAmount =
    cart.totalAmount || cart.items.reduce((total, item) => total + item.subtotal, 0);

  return (
    <aside className="rounded-md bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-ink">Resumen del pedido</h2>
      <div className="mt-5 space-y-4">
        {cart.items.map((item) => (
          <div key={item.cartItemId} className="border-b border-ink/10 pb-4 last:border-b-0">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-bold text-ink">{item.productName}</p>
                <p className="text-sm text-ink/60">
                  {item.quantity} x {formatMoney(item.unitPriceAtAdded)}
                </p>
              </div>
              <span className="font-bold text-copper">{formatMoney(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between border-t border-ink/10 pt-4 text-lg">
        <span className="font-bold text-ink">Total</span>
        <span className="font-bold text-copper">{formatMoney(totalAmount)}</span>
      </div>
    </aside>
  );
}
