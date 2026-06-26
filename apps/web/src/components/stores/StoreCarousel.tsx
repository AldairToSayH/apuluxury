"use client";

import { useEffect, useRef } from "react";

import type { PublicStore } from "@/types/api";
import { StoreCard } from "./StoreCard";

type StoreCarouselProps = {
  stores: PublicStore[];
};

export function StoreCarousel({ stores }: StoreCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (stores.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      const scroller = scrollerRef.current;

      if (!scroller) {
        return;
      }

      currentIndexRef.current = (currentIndexRef.current + 1) % stores.length;
      const target = scroller.children.item(currentIndexRef.current) as
        | HTMLElement
        | null;

      if (!target) {
        return;
      }

      scroller.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth",
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, [stores.length]);

  if (stores.length === 0) {
    return null;
  }

  return (
    <div className="-mx-6 overflow-hidden px-6 pb-4">
      <div
        className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
      >
        {stores.map((store) => (
          <div
            className="min-w-[18rem] max-w-[18rem] snap-start sm:min-w-[22rem] sm:max-w-[22rem]"
            key={store.id}
          >
            <StoreCard compact store={store} />
          </div>
        ))}
      </div>
    </div>
  );
}
