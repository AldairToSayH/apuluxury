"use client";

import { FormEvent, useState } from "react";

import type { Category, ProductFormValues, SellerProduct } from "@/types/api";

type ProductFormProps = {
  categories: Category[];
  initialProduct?: SellerProduct;
  allowedStatuses: Array<ProductFormValues["status"]>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

function toOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  return text || undefined;
}

export function ProductForm({
  categories,
  initialProduct,
  allowedStatuses,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await onSubmit({
        category_id: String(formData.get("category_id")),
        name: String(formData.get("name")),
        slug: String(formData.get("slug")),
        description: toOptionalString(formData.get("description")),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        material: toOptionalString(formData.get("material")),
        color: toOptionalString(formData.get("color")),
        size: toOptionalString(formData.get("size")),
        status: String(formData.get("status")) as ProductFormValues["status"],
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-md border border-white/70 bg-white/[0.92] p-6 shadow-soft backdrop-blur md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-semibold text-ink/70">
        Categoria
        <select
          className="rounded-md border border-ink/15 px-4 py-3"
          name="category_id"
          defaultValue={initialProduct?.categoryId ?? categories[0]?.id ?? ""}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink/70">
        Estado
        <select
          className="rounded-md border border-ink/15 px-4 py-3"
          name="status"
          defaultValue={
            initialProduct?.status === "rejected"
              ? "inactive"
              : initialProduct?.status ?? "draft"
          }
        >
          {allowedStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="name"
        placeholder="Nombre del producto"
        defaultValue={initialProduct?.name}
        required
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="slug"
        placeholder="URL corta, ejemplo: poncho-alpaca-rojo"
        defaultValue={initialProduct?.slug}
        required
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="price"
        placeholder="Precio en soles"
        type="number"
        min="0"
        step="0.01"
        defaultValue={initialProduct?.price ?? 0}
        required
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="stock"
        placeholder="Cantidad disponible"
        type="number"
        min="0"
        step="1"
        defaultValue={initialProduct?.stock ?? 0}
        required
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="material"
        placeholder="Material, ejemplo: alpaca, cuero, plata"
        defaultValue={initialProduct?.material ?? ""}
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="color"
        placeholder="Color principal"
        defaultValue={initialProduct?.color ?? ""}
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="size"
        placeholder="Talla o medida"
        defaultValue={initialProduct?.size ?? ""}
      />
      <textarea
        className="min-h-32 rounded-md border border-ink/15 px-4 py-3 md:col-span-2"
        name="description"
        placeholder="Describe la historia, tecnica o detalles del producto"
        defaultValue={initialProduct?.description ?? ""}
      />
      <button
        className="rounded-full bg-ink px-5 py-3 font-bold text-white shadow-sm transition hover:bg-copper disabled:opacity-60 md:col-span-2"
        type="submit"
        disabled={isSubmitting || categories.length === 0}
      >
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
