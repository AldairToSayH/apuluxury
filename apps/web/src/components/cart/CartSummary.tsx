type CartSummaryProps = {
  totalAmount: number;
  totalQuantity: number;
  onClear: () => void;
  checkoutHref?: string;
  isClearing: boolean;
  isDisabled: boolean;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export function CartSummary({
  totalAmount,
  totalQuantity,
  onClear,
  checkoutHref,
  isClearing,
  isDisabled,
}: CartSummaryProps) {
  return (
    <aside className="luxury-card p-6">
      <h2 className="text-2xl font-black text-ink">Resumen</h2>
      <div className="mt-5 space-y-3 text-sm text-ink/70">
        <div className="flex justify-between gap-4">
          <span>Items</span>
          <span className="font-bold text-ink">{totalQuantity}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-ink/10 pt-3 text-base">
          <span>Total</span>
          <span className="font-bold text-copper">{formatMoney(totalAmount)}</span>
        </div>
      </div>
      {checkoutHref && (
        <a
          className={`mt-6 block rounded-full px-5 py-3 text-center font-black text-white ${
            isDisabled
              ? "pointer-events-none bg-ink/40"
              : "bg-copper hover:bg-ink"
          }`}
          href={checkoutHref}
          aria-disabled={isDisabled}
        >
          Continuar compra
        </a>
      )}
      <button
        className="mt-3 w-full rounded-full border border-red-200 bg-white px-5 py-3 font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={onClear}
        disabled={isDisabled || isClearing}
      >
        {isClearing ? "Vaciando..." : "Vaciar carrito"}
      </button>
    </aside>
  );
}
