"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/auth";
import { sellerNavItems } from "@/components/seller/SellerSidebar";

function isActivePath(pathname: string, href: string) {
  if (href === "/vendedor") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SellerMobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <div className="mb-5 flex items-center justify-between rounded-md border border-ink/10 bg-white p-3 shadow-soft">
        <button
          className="grid size-10 place-items-center rounded-full bg-ink text-white shadow-sm"
          type="button"
          aria-expanded={isOpen}
          aria-label="Abrir menu de vendedor"
          onClick={() => setIsOpen(true)}
        >
          <span className="grid w-4 gap-1" aria-hidden="true">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-copper">
            Vendedor
          </p>
          <p className="font-black text-ink">Menu de tienda</p>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-ink/62 text-white backdrop-blur-md animate-[apuDrawerOverlay_180ms_ease-out] lg:hidden">
          <div className="ml-auto flex min-h-screen w-[min(23rem,88vw)] flex-col overflow-y-auto bg-[#18120f] shadow-[0_28px_90px_rgba(0,0,0,0.42)] animate-[apuDrawerPanel_240ms_ease-out]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
              <Link
                className="brand-font text-2xl font-black tracking-wide text-white"
                href="/vendedor"
                onClick={() => setIsOpen(false)}
              >
                APU LUXURY
              </Link>
              <button
                className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/[0.14]"
                type="button"
                aria-label="Cerrar menu de vendedor"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="grid flex-1 gap-7 px-6 py-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">
                  Vendedores
                </p>
                <p className="mt-2 text-sm font-semibold text-white/55">
                  Gestiona tu tienda, productos y pedidos.
                </p>
              </div>

              <nav className="grid gap-4 text-base font-semibold">
                {sellerNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      className={`transition ${
                        isActive ? "text-maize" : "text-white/90 hover:text-maize"
                      }`}
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 pt-6">
                <button
                  className="w-full rounded-full border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-white/[0.14]"
                  type="button"
                  onClick={logout}
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
