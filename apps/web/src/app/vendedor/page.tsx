"use client";

import Link from "next/link";

import { ProtectedPage } from "@/components/ui/ProtectedPage";
import type { MeResponse, SellerValidationStatus } from "@/types/api";

const links = [
  {
    href: "/vendedor/productos",
    label: "Mis productos",
    text: "Administra catalogo, stock, estado e imagenes.",
  },
  {
    href: "/vendedor/productos/nuevo",
    label: "Crear producto",
    text: "Publica una nueva pieza para tu tienda.",
  },
  {
    href: "/vendedor/pedidos",
    label: "Pedidos recibidos",
    text: "Gestiona preparacion, envio y entrega.",
  },
  {
    href: "/vendedor/perfil",
    label: "Perfil de tienda",
    text: "Actualiza los datos visibles y de contacto de tu negocio.",
  },
];

const statusLabels: Record<SellerValidationStatus, string> = {
  pending: "Pendiente de aprobacion",
  approved: "Aprobado",
  rejected: "Rechazado",
  suspended: "Suspendido",
};

const statusClasses: Record<SellerValidationStatus, string> = {
  pending: "border-maize/55 bg-maize/28 text-ink",
  approved: "border-mineral/25 bg-mineral/10 text-mineral",
  rejected: "border-red-200 bg-red-50 text-red-700",
  suspended: "border-ink/15 bg-ink/8 text-ink",
};

function getSellerName(session: MeResponse) {
  return session.seller?.commercialName?.trim() || session.user.email;
}

export default function SellerDashboardPage() {
  return (
    <ProtectedPage role="seller">
      {(session) => (
        <section className="space-y-6">
          <div className="overflow-hidden rounded-md border border-white/70 bg-white/86 p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">Vendedor</p>
                <h1 className="mt-3 text-4xl font-black text-ink md:text-5xl">
                  Bienvenido, {getSellerName(session)}
                </h1>
                <p className="mt-3 max-w-2xl text-ink/64">
                  Administra tu tienda, productos y pedidos desde un panel pensado
                  para operaciones de marketplace artesanal premium.
                </p>
              </div>
              {session.seller && (
                <span
                  className={`w-fit rounded-full border px-4 py-2 text-sm font-black ${statusClasses[session.seller.validationStatus]}`}
                >
                  {statusLabels[session.seller.validationStatus]}
                </span>
              )}
            </div>
          </div>

          {session.seller?.validationStatus === "pending" && (
            <p className="rounded-md border border-maize/45 bg-maize/24 p-4 font-semibold leading-7 text-ink">
              Tu cuenta de vendedor esta pendiente de aprobacion. Cuando sea
              aprobada podras publicar productos activos.
            </p>
          )}

          {session.store && (
            <div className="rounded-md border border-white/70 bg-white/86 p-5 shadow-soft">
              <p className="eyebrow">Subdominio de tienda</p>
              <p className="mt-2 text-2xl font-black text-ink">
                {session.store.subdomain}.apuluxury.com
              </p>
              <p className="mt-2 text-sm font-semibold text-ink/58">
                {session.seller?.validationStatus === "approved"
                  ? "Tu subdominio ya esta activo para tu tienda publica."
                  : "Tu subdominio esta reservado y se activara cuando el administrador apruebe tu cuenta."}
              </p>
              {session.seller?.validationStatus === "approved" && (
                <Link
                  className="secondary-action mt-4"
                  href={`/tienda/${session.store.slug}`}
                >
                  Ver tienda publica
                </Link>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {links.map((link) => (
              <Link
                className="luxury-card p-6 transition hover:-translate-y-1 hover:border-copper/30"
                href={link.href}
                key={link.href}
              >
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
