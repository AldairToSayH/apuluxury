import Link from "next/link";

import { ProductImage } from "@/components/products/ProductImage";
import type { PublicStore } from "@/types/api";

type StoreCardProps = {
  store: PublicStore;
  compact?: boolean;
};

export function StoreCard({ store, compact = false }: StoreCardProps) {
  const images = store.sampleProducts.slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-white/70 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,20,18,0.16)]">
      <div className="grid grid-cols-3 gap-1 bg-ink/5 p-1">
        {[0, 1, 2].map((index) => {
          const product = images[index];

          return (
            <ProductImage
              alt={product?.name ?? store.commercialName}
              className={`${compact ? "h-24" : "h-32"} w-full rounded-sm object-cover`}
              key={`${store.id}-${index}`}
              sizes="(min-width: 1024px) 12vw, 33vw"
              src={product?.mainImageUrl}
            />
          );
        })}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="ui-font text-xs font-black uppercase tracking-[0.16em] text-copper">
          Tienda artesanal
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-ink">
          {store.commercialName}
        </h2>
        <p className="mt-1 text-xs font-bold text-mineral">
          {store.subdomain}.apuluxury.com
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/62">
          {store.businessDescription ??
            "Una tienda seleccionada por APU LUXURY con piezas artesanales listas para descubrir."}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-cloud px-3 py-1 text-xs font-black text-ink/62">
            {store.productCount} producto{store.productCount === 1 ? "" : "s"}
          </span>
          <Link
            className="rounded-full bg-mineral px-5 py-2 text-sm font-black text-white transition hover:bg-ink"
            href={`/tienda/${store.slug}`}
          >
            Ver tienda
          </Link>
        </div>
      </div>
    </article>
  );
}
