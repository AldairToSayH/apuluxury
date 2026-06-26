"use client";

import type { ProductStatus } from "@/types/api";

type AdminProductStatusActionsProps = {
  currentStatus: ProductStatus;
  isUpdating: boolean;
  onUpdate: (status: ProductStatus) => void;
};

const statuses: Array<{ status: ProductStatus; label: string }> = [
  { status: "draft", label: "Borrador" },
  { status: "active", label: "Activo" },
  { status: "inactive", label: "Inactivo" },
  { status: "rejected", label: "Rechazado" },
];

export function AdminProductStatusActions({
  currentStatus,
  isUpdating,
  onUpdate,
}: AdminProductStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((item) => (
        <button
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isUpdating || currentStatus === item.status}
          key={item.status}
          onClick={() => onUpdate(item.status)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
