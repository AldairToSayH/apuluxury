"use client";

import type { FormEvent } from "react";

import type { CreateOrderPayload } from "@/types/api";

type CheckoutFormProps = {
  onSubmit: (payload: CreateOrderPayload) => void;
  isSubmitting: boolean;
};

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const payload: CreateOrderPayload = {
      delivery_full_name: String(form.get("delivery_full_name") ?? "").trim(),
      delivery_phone: String(form.get("delivery_phone") ?? "").trim(),
      delivery_address: String(form.get("delivery_address") ?? "").trim(),
    };
    const reference = String(form.get("delivery_reference") ?? "").trim();

    if (reference) {
      payload.delivery_reference = reference;
    }

    onSubmit(payload);
  };

  return (
    <form className="rounded-md bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-ink">Datos de entrega</h2>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Nombre completo
          <input
            className="rounded-md border border-ink/15 px-4 py-3"
            name="delivery_full_name"
            placeholder="Nombre y apellido de quien recibe"
            required
            maxLength={200}
            disabled={isSubmitting}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Telefono
          <input
            className="rounded-md border border-ink/15 px-4 py-3"
            name="delivery_phone"
            placeholder="Celular para coordinar la entrega"
            required
            maxLength={30}
            disabled={isSubmitting}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Direccion
          <textarea
            className="min-h-28 rounded-md border border-ink/15 px-4 py-3"
            name="delivery_address"
            placeholder="Direccion completa, distrito y ciudad"
            required
            disabled={isSubmitting}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Referencia
          <textarea
            className="min-h-24 rounded-md border border-ink/15 px-4 py-3"
            name="delivery_reference"
            placeholder="Referencia opcional, por ejemplo: frente a la plaza"
            disabled={isSubmitting}
          />
        </label>
      </div>
      <button
        className="mt-6 w-full rounded-full bg-ink px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando pedido..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
