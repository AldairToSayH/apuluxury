"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { SellerOrderItems } from "@/components/orders/SellerOrderItems";
import { SellerOrderStatusActions } from "@/components/orders/SellerOrderStatusActions";
import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getSellerOrderDetail,
  updateSellerOrderStatus,
  type SellerOrderUpdateStatus,
} from "@/lib/sellerOrdersApi";
import type { SellerOrderDetail } from "@/types/api";

function formatMoney(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SellerOrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [sellerOrder, setSellerOrder] = useState<SellerOrderDetail | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadDetail = () => {
    const token = getToken();

    if (!token || !params.id) {
      setIsLoading(false);
      setError("No se pudo cargar el pedido.");
      return;
    }

    setIsLoading(true);
    setError("");

    getSellerOrderDetail(token, params.id)
      .then((response) => setSellerOrder(response.sellerOrder))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el pedido recibido",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDetail();
  }, [params.id]);

  const handleUpdate = async (status: SellerOrderUpdateStatus) => {
    const token = getToken();

    if (!token || !params.id) {
      setError("No se pudo actualizar el pedido.");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateSellerOrderStatus(token, params.id, status);
      setSellerOrder(response.sellerOrder);
      setSuccess("Estado actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo actualizar el estado",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link className="font-bold text-mineral hover:text-ink" href="/vendedor/pedidos">
          Volver a pedidos
        </Link>
      </div>

      {error && <p className="mb-5 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
      {success && (
        <p className="mb-5 rounded-md bg-green-50 p-4 text-green-700">{success}</p>
      )}

      {isLoading ? (
        <div className="space-y-5">
          <div className="h-56 animate-pulse rounded-md bg-white shadow-soft" />
          <div className="h-44 animate-pulse rounded-md bg-white shadow-soft" />
        </div>
      ) : !sellerOrder ? (
        <div className="rounded-md bg-white p-10 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-ink">Pedido no encontrado</h1>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-md bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-ink">
                    {sellerOrder.orderCode ?? sellerOrder.id}
                  </h1>
                  <OrderStatusBadge status={sellerOrder.status} />
                </div>
                <p className="mt-2 text-sm text-ink/60">{formatDate(sellerOrder.createdAt)}</p>
                <p className="mt-3 text-sm text-ink/70">Seller order: {sellerOrder.id}</p>
              </div>
              <p className="text-2xl font-bold text-copper">
                {formatMoney(sellerOrder.subtotalAmount)}
              </p>
            </div>

            <div className="mt-6 grid gap-4 border-t border-ink/10 pt-5 text-sm text-ink/70 md:grid-cols-2">
              <div>
                <p className="font-bold text-ink">Entrega</p>
                <p>{sellerOrder.deliveryFullName}</p>
                <p>{sellerOrder.deliveryPhone}</p>
                <p>{sellerOrder.deliveryAddress}</p>
                {sellerOrder.deliveryReference && <p>{sellerOrder.deliveryReference}</p>}
              </div>
              <div>
                <p className="font-bold text-ink">Comprador</p>
                <p>{sellerOrder.buyerEmail}</p>
              </div>
            </div>
          </div>

          <SellerOrderStatusActions
            currentStatus={sellerOrder.status}
            isUpdating={isUpdating}
            onUpdate={handleUpdate}
          />
          <SellerOrderItems sellerOrder={sellerOrder} />
        </div>
      )}
    </section>
  );
}

export default function SellerOrderDetailPage() {
  return <ProtectedPage role="seller">{() => <SellerOrderDetailContent />}</ProtectedPage>;
}
