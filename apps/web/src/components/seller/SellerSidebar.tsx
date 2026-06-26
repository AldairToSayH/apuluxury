"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/auth";

export const sellerNavItems = [
  { href: "/vendedor", label: "Dashboard" },
  { href: "/vendedor/productos", label: "Mis productos" },
  { href: "/vendedor/productos/nuevo", label: "Crear producto" },
  { href: "/vendedor/pedidos", label: "Pedidos recibidos" },
  { href: "/vendedor/perfil", label: "Perfil de tienda" },
  { href: "/catalogo", label: "Ver catalogo" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/vendedor") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 overflow-hidden rounded-md border border-white/12 bg-ink text-white shadow-soft lg:block">
      <div className="border-b border-white/10 p-6">
        <p className="brand-font text-xl font-black tracking-wide">APU LUXURY</p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Operaciones de tienda
        </p>
      </div>

      <nav className="grid gap-1 p-4">
        {sellerNavItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              className={`rounded-md px-4 py-3 text-sm font-bold transition ${
                isActive
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
          className="w-full rounded-md border border-white/15 px-4 py-3 text-left text-sm font-bold text-white/76 transition hover:bg-white/10 hover:text-white"
          type="button"
          onClick={logout}
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
