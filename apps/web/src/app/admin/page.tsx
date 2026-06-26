"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminDashboardCard } from "@/components/admin/AdminDashboardCard";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getAdminOrders } from "@/lib/adminOrdersApi";
import { getAdminProducts } from "@/lib/adminProductsApi";
import { getAdminSellers } from "@/lib/adminSellersApi";
import type { AdminProduct, AdminSeller, OrderSummary } from "@/types/api";

type AdminDashboardData = {
  sellers: AdminSeller[];
  products: AdminProduct[];
  orders: OrderSummary[];
};

const emptyData: AdminDashboardData = {
  sellers: [],
  products: [],
  orders: [],
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setError("Inicia sesion como admin.");
      setIsLoading(false);
      return;
    }

    Promise.all([
      getAdminSellers(token),
      getAdminProducts(token),
      getAdminOrders(token),
    ])
      .then(([sellersResponse, productsResponse, ordersResponse]) => {
        setData({
          sellers: sellersResponse.sellers,
          products: productsResponse.products,
          orders: ordersResponse.orders,
        });
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el resumen administrativo",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const pendingSellers = data.sellers.filter(
      (seller) => seller.validationStatus === "pending",
    ).length;
    const approvedSellers = data.sellers.filter(
      (seller) => seller.validationStatus === "approved",
    ).length;
    const activeProducts = data.products.filter(
      (product) => product.status === "active",
    ).length;
    const pendingProducts = data.products.filter(
      (product) => product.status === "draft",
    ).length;
    const pendingOrders = data.orders.filter(
      (order) => order.status === "pending",
    ).length;
    const totalSales = data.orders.reduce(
      (total, order) => total + order.totalAmount,
      0,
    );

    return {
      pendingSellers,
      approvedSellers,
      activeProducts,
      pendingProducts,
      pendingOrders,
      totalSales,
    };
  }, [data]);

  const cards = [
    {
      href: "/admin/vendedores",
      title: "Vendedores",
      description: "Revisa postulaciones, aprobaciones y suspensiones.",
      eyebrow: "Validacion",
      metric: `${metrics.pendingSellers} pendientes`,
    },
    {
      href: "/admin/productos",
      title: "Productos",
      description: "Modera catalogo, visibilidad y calidad de publicaciones.",
      eyebrow: "Catalogo",
      metric: `${metrics.activeProducts} activos`,
    },
    {
      href: "/admin/pedidos",
      title: "Pedidos",
      description: "Consulta pedidos globales y ordenes por vendedor.",
      eyebrow: "Operacion",
      metric: `${metrics.pendingOrders} pendientes`,
    },
  ];

  return (
    <ProtectedPage role="admin">
      {(session) => (
        <section className="px-6 py-8 md:px-8 lg:px-10">
          <div className="overflow-hidden rounded-md bg-ink p-6 text-white shadow-soft md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-maize">
                  Centro administrativo
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-black md:text-5xl">
                  Control operativo de APU LUXURY
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66">
                  Supervisa vendedores, productos y pedidos desde un panel
                  pensado para mantener la calidad del marketplace.
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/48">
                  Sesion admin
                </p>
                <p className="mt-2 text-sm font-bold text-white">{session.user.email}</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-md bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              [0, 1, 2, 3].map((item) => (
                <div className="h-32 animate-pulse rounded-md bg-white shadow-soft" key={item} />
              ))
            ) : (
              <>
                <MetricCard
                  label="Vendedores aprobados"
                  value={String(metrics.approvedSellers)}
                  detail={`${metrics.pendingSellers} pendientes de revision`}
                />
                <MetricCard
                  label="Productos activos"
                  value={String(metrics.activeProducts)}
                  detail={`${metrics.pendingProducts} en borrador`}
                />
                <MetricCard
                  label="Pedidos pendientes"
                  value={String(metrics.pendingOrders)}
                  detail={`${data.orders.length} pedidos registrados`}
                />
                <MetricCard
                  label="Venta total registrada"
                  value={formatMoney(metrics.totalSales)}
                  detail="Pedidos del entorno local"
                />
              </>
            )}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cards.map((card) => (
              <AdminDashboardCard key={card.href} {...card} />
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-copper">
                    Prioridad
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-ink">
                    Tareas que requieren atencion
                  </h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <PriorityRow
                  label="Vendedores por aprobar"
                  value={metrics.pendingSellers}
                />
                <PriorityRow
                  label="Productos en borrador"
                  value={metrics.pendingProducts}
                />
                <PriorityRow
                  label="Pedidos pendientes"
                  value={metrics.pendingOrders}
                />
              </div>
            </section>

            <section className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-copper">
                Gobierno del marketplace
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">
                Calidad antes que volumen
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink/64">
                Este panel separa las decisiones administrativas del flujo de
                compra y venta. Mantiene la moderacion cerca de vendedores,
                catalogo y pedidos sin mezclar acciones operativas con la
                experiencia publica.
              </p>
            </section>
          </div>
        </section>
      )}
    </ProtectedPage>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/48">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-ink">{value}</p>
      <p className="mt-2 text-sm font-semibold text-ink/58">{detail}</p>
    </article>
  );
}

function PriorityRow({ label, value }: { label: string; value: number }) {
  const hasWork = value > 0;

  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-cloud p-4">
      <span className="font-bold text-ink">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-sm font-black ${
          hasWork ? "bg-maize text-ink" : "bg-mineral/10 text-mineral"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
