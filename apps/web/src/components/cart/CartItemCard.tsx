import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductImage } from "@/components/products/ProductImage";
import type { CartItem } from "@/types/api";

type CartItemCardProps = {
  item: CartItem;
  isBusy: boolean;
  onUpdate: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
};

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export function CartItemCard({
  item,
  isBusy,
  onUpdate,
  onRemove,
}: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const imageUrl = item.mainImageUrl ?? item.imageUrl;

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  return (
    <article className="luxury-card grid gap-5 p-4 md:grid-cols-[8rem_1fr_auto]">
      <ProductImage
        alt={item.productName}
        className="aspect-square w-full rounded-md object-cover md:w-32"
        sizes="(min-width: 768px) 8rem, 100vw"
        src={imageUrl}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <Link
            className="text-lg font-bold text-ink hover:text-mineral"
            href={`/producto/${item.productSlug}`}
          >
            {item.productName}
          </Link>
          <span className="rounded-full bg-cloud px-3 py-1 text-xs font-black uppercase text-ink/60">
            {item.productStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink/60">{item.productSlug}</p>
        <div className="mt-4 grid gap-1 text-sm text-ink/70">
          <span>Vendedor: {item.commercialName}</span>
          <span>Categoria: {item.categoryName}</span>
          <span>Precio unitario: {formatMoney(item.unitPriceAtAdded)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:w-44 md:items-end">
        <p className="text-lg font-bold text-copper">{formatMoney(item.subtotal)}</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          Cantidad
          <input
            className="h-10 w-20 rounded-md border border-ink/15 px-3"
            min={1}
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={isBusy}
          />
        </label>
        <div className="flex gap-2">
          <button
            className="rounded-full bg-mineral px-4 py-2 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => onUpdate(item.cartItemId, quantity)}
            disabled={isBusy || quantity < 1 || quantity === item.quantity}
          >
            Actualizar
          </button>
          <button
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={() => onRemove(item.cartItemId)}
            disabled={isBusy}
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
