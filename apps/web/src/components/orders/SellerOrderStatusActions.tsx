"use client";

import type { SellerOrderUpdateStatus } from "@/lib/sellerOrdersApi";
import type { SellerOrderStatus } from "@/types/api";

type SellerOrderStatusActionsProps = {
  currentStatus: SellerOrderStatus;
  isUpdating: boolean;
  onUpdate: (status: SellerOrderUpdateStatus) => void;
};

const actions: Array<{ status: SellerOrderUpdateStatus; label: string }> = [
  { status: "in_preparation", label: "En preparacion" },
  { status: "shipped", label: "Enviado" },
  { status: "delivered", label: "Entregado" },
  { status: "cancelled", label: "Cancelado" },
];

export function SellerOrderStatusActions({
  currentStatus,
  isUpdating,
  onUpdate,
}: SellerOrderStatusActionsProps) {
  return (
    <div className="rounded-md bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-ink">Actualizar estado</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUpdating || currentStatus === action.status}
            key={action.status}
            onClick={() => onUpdate(action.status)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
