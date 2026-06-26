import type { AdminSeller, SellerValidationStatus } from "@/types/api";

type AdminSellerCardProps = {
  seller: AdminSeller;
  busyAction: string | null;
  onAction: (id: string, action: SellerValidationStatus) => void;
};

const statusLabels: Record<SellerValidationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  suspended: "Suspendido",
};

const statusClasses: Record<SellerValidationStatus, string> = {
  pending: "bg-yellow-50 text-yellow-800",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  suspended: "bg-ink/10 text-ink",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function AdminSellerCard({
  seller,
  busyAction,
  onAction,
}: AdminSellerCardProps) {
  const isBusy = Boolean(busyAction);

  return (
    <article className="rounded-md bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-ink">{seller.commercialName}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClasses[seller.validationStatus]}`}
            >
              {statusLabels[seller.validationStatus]}
            </span>
          </div>
          <div className="mt-4 grid gap-1 text-sm text-ink/70 md:grid-cols-2">
            <span>Slug: {seller.slug}</span>
            <span>Email: {seller.userEmail}</span>
            <span>RUC: {seller.ruc ?? "Sin RUC"}</span>
            <span>Telefono: {seller.phone ?? "Sin telefono"}</span>
            <span>Creado: {formatDate(seller.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full bg-mineral px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            disabled={isBusy || seller.validationStatus === "approved"}
            onClick={() => onAction(seller.id, "approved")}
            type="button"
          >
            Aprobar
          </button>
          <button
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50"
            disabled={isBusy || seller.validationStatus === "rejected"}
            onClick={() => onAction(seller.id, "rejected")}
            type="button"
          >
            Rechazar
          </button>
          <button
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
            disabled={isBusy || seller.validationStatus === "suspended"}
            onClick={() => onAction(seller.id, "suspended")}
            type="button"
          >
            Suspender
          </button>
        </div>
      </div>
    </article>
  );
}
