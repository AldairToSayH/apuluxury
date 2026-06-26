import type { OrderStatus, SellerOrderStatus } from "@/types/api";

type OrderStatusBadgeProps = {
  status: OrderStatus | SellerOrderStatus;
};

const statusLabels: Record<OrderStatus | SellerOrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
  in_preparation: "En preparacion",
  shipped: "Enviado",
  delivered: "Entregado",
};

const statusClasses: Record<OrderStatus | SellerOrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-800",
  confirmed: "bg-blue-50 text-blue-800",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-green-50 text-green-700",
  in_preparation: "bg-blue-50 text-blue-800",
  shipped: "bg-mineral/10 text-mineral",
  delivered: "bg-green-50 text-green-700",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
