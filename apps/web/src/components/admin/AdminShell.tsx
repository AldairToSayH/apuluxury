"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { logout } from "@/lib/auth";

const adminNavItems = [
  { href: "/admin", label: "Centro de control" },
  { href: "/admin/vendedores", label: "Vendedores" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/catalogo", label: "Ver catalogo" },
];

type AdminShellProps = {
  children: ReactNode;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: AdminShellProps) {
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#171412_0%,#241d18_48%,#3c2b20_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[92rem] gap-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.06] shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:block">
          <div className="border-b border-white/10 p-6">
            <p className="brand-font text-2xl font-black tracking-wide">APU LUXURY</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-maize">
              Administracion
            </p>
          </div>

          <nav className="grid gap-1 p-4">
            {adminNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  className={`rounded-md px-4 py-3 text-sm font-black transition ${
                    active
                      ? "bg-maize text-ink"
                      : "text-white/72 hover:bg-white/10 hover:text-white"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-x-4 bottom-4">
            <button
              className="w-full rounded-md border border-white/15 px-4 py-3 text-left text-sm font-black text-white/72 transition hover:bg-white/10 hover:text-white"
              type="button"
              onClick={logout}
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.08] p-3 shadow-soft backdrop-blur-xl lg:hidden">
            <button
              className="grid size-10 place-items-center rounded-full bg-maize text-ink shadow-sm"
              type="button"
              aria-expanded={isOpen}
              aria-label="Abrir menu de administrador"
              onClick={() => setIsOpen(true)}
            >
              <span className="grid w-4 gap-1" aria-hidden="true">
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
              </span>
            </button>
            <div className="text-right">
              <p className="brand-font text-lg font-black">APU LUXURY</p>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-maize">
                Admin
              </p>
            </div>
          </div>

          {isOpen && (
            <div className="fixed inset-0 z-[999] bg-ink/62 text-white backdrop-blur-md animate-[apuDrawerOverlay_180ms_ease-out] lg:hidden">
              <div className="ml-auto flex min-h-screen w-[min(23rem,88vw)] flex-col overflow-y-auto bg-[#18120f] shadow-[0_28px_90px_rgba(0,0,0,0.42)] animate-[apuDrawerPanel_240ms_ease-out]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
                  <Link
                    className="brand-font text-2xl font-black tracking-wide text-white"
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                  >
                    APU LUXURY
                  </Link>
                  <button
                    className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/[0.14]"
                    type="button"
                    aria-label="Cerrar menu de administrador"
                    onClick={() => setIsOpen(false)}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="grid flex-1 gap-7 px-6 py-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">
                      Administracion
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/55">
                      Controla vendedores, productos y pedidos.
                    </p>
                  </div>

                  <nav className="grid gap-4 text-base font-semibold">
                    {adminNavItems.map((item) => {
                      const active = isActivePath(pathname, item.href);

                      return (
                        <Link
                          className={`transition ${
                            active ? "text-maize" : "text-white/90 hover:text-maize"
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

          <div className="overflow-hidden rounded-md border border-white/70 bg-cloud text-ink shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
