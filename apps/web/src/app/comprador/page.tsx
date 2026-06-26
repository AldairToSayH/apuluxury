"use client";

import Link from "next/link";

import { ProtectedPage } from "@/components/ui/ProtectedPage";
import type { MeResponse } from "@/types/api";

function getDisplayName(session: MeResponse) {
  const firstName = session.buyer?.firstName?.trim();

  return firstName || session.user.email;
}

export default function BuyerDashboardPage() {
  const links = [
    {
      href: "/comprador/carrito",
      label: "Mi carrito",
      text: "Revisa las piezas que seleccionaste antes de comprar.",
    },
    {
      href: "/comprador/pedidos",
      label: "Mis pedidos",
      text: "Consulta el estado de tus compras y entregas.",
    },
    {
      href: "/comprador/perfil",
      label: "Mi perfil",
      text: "Actualiza tus datos personales y de contacto.",
    },
    {
      href: "/catalogo",
      label: "Catalogo",
      text: "Descubre moda andina y artesania premium.",
    },
  ];

  return (
    <ProtectedPage role="buyer">
      {(session) => (
        <section className="site-shell">
          <p className="eyebrow">Comprador</p>
          <h1 className="mt-3 text-4xl font-black text-ink">
            Hola, {getDisplayName(session)}
          </h1>
          <p className="mt-3 max-w-2xl text-ink/64">
            Tu espacio para continuar compras, revisar pedidos y descubrir nuevas
            piezas artesanales.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {links.map((link) => (
              <Link className="luxury-card p-6 transition hover:-translate-y-1" href={link.href} key={link.label}>
                <h2 className="text-2xl font-black text-ink">{link.label}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/60">{link.text}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ProtectedPage>
  );
}
