"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BuyerOrderItems } from "@/components/orders/BuyerOrderItems";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import { getAdminOrderDetail } from "@/lib/adminOrdersApi";
import type { OrderDetail } from "@/types/api";

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminOrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token || !params.id) {
      setError("No se pudo cargar el pedido.");
      setIsLoading(false);
      return;
    }

    getAdminOrderDetail(token, params.id)
      .then((response) => setOrder(response.order))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el pedido",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [params.id]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link className="font-bold text-mineral hover:text-ink" href="/admin/pedidos">
          Volver a pedidos
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}

      {isLoading ? (
        <div className="space-y-5">
          <div className="h-56 animate-pulse rounded-md bg-white shadow-soft" />
          <div className="h-64 animate-pulse rounded-md bg-white shadow-soft" />
        </div>
      ) : !order ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-ink">Pedido no encontrado</h1>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-md bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-ink">{order.orderCode}</h1>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm text-ink/60">{formatDate(order.createdAt)}</p>
              </div>
              <p className="text-2xl font-bold text-copper">
                {formatMoney(order.totalAmount, order.currency)}
              </p>
            </div>

            <div className="mt-6 grid gap-4 border-t border-ink/10 pt-5 text-sm text-ink/70 md:grid-cols-3">
              <div>
                <p className="font-bold text-ink">Comprador</p>
                <p>{order.buyerEmail ?? order.buyerId}</p>
              </div>
              <div>
                <p className="font-bold text-ink">Entrega</p>
                <p>{order.deliveryFullName}</p>
                <p>{order.deliveryPhone}</p>
                <p>{order.deliveryAddress}</p>
                {order.deliveryReference && <p>{order.deliveryReference}</p>}
              </div>
              <div>
                <p className="font-bold text-ink">Totales</p>
                <p>{order.sellerOrders.length} orden(es) de vendedor</p>
                <p>{formatMoney(order.totalAmount, order.currency)}</p>
              </div>
            </div>
          </div>

          <BuyerOrderItems order={order} />
        </div>
      )}
    </section>
  );
}

export default function AdminOrderDetailPage() {
  return <ProtectedPage role="admin">{() => <AdminOrderDetailContent />}</ProtectedPage>;
}
