"use client";

import { FormEvent, useState } from "react";

import type { ProductImageValues } from "@/lib/sellerApi";

type ProductImageFormProps = {
  onSubmit: (values: ProductImageValues) => Promise<void>;
};

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  return text || undefined;
}

export function ProductImageForm({ onSubmit }: ProductImageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await onSubmit({
        image_url: String(formData.get("image_url")),
        alt_text: optionalText(formData.get("alt_text")),
        position: Number(formData.get("position") ?? 0),
        is_main: formData.get("is_main") === "on",
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-md border border-white/70 bg-white/[0.92] p-6 shadow-soft backdrop-blur md:grid-cols-[1fr_1fr_auto]"
      onSubmit={handleSubmit}
    >
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="image_url"
        placeholder="URL publica de la imagen"
        type="url"
        required
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="alt_text"
        placeholder="Texto descriptivo, ejemplo: poncho rojo de alpaca"
      />
      <input
        className="rounded-md border border-ink/15 px-4 py-3"
        name="position"
        placeholder="Orden de aparicion"
        type="number"
        min="0"
        defaultValue="0"
      />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
        <input name="is_main" type="checkbox" />
        Usar como imagen principal
      </label>
      <button
        className="rounded-full bg-ink px-5 py-3 font-bold text-white shadow-sm transition hover:bg-copper disabled:opacity-60 md:col-span-2"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Agregando..." : "Agregar imagen"}
      </button>
    </form>
  );
}
