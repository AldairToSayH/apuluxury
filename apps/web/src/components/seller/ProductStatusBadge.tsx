import type { ProductStatus } from "@/types/api";

const styles: Record<ProductStatus, string> = {
  draft: "bg-ink/10 text-ink",
  active: "bg-mineral/10 text-mineral",
  inactive: "bg-maize/30 text-ink",
  rejected: "bg-red-100 text-red-700",
};

const labels: Record<ProductStatus, string> = {
  draft: "Borrador",
  active: "Activo",
  inactive: "Inactivo",
  rejected: "Rechazado",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
