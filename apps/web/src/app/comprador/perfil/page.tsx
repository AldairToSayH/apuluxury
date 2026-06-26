"use client";

import { FormEvent, useEffect, useState } from "react";

import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getBuyerProfile,
  updateBuyerProfile,
  type BuyerProfileValues,
} from "@/lib/buyerApi";
import type { BuyerProfile } from "@/types/api";

type BuyerProfileForm = {
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  address: string;
};

const emptyForm: BuyerProfileForm = {
  first_name: "",
  last_name: "",
  dni: "",
  phone: "",
  address: "",
};

function toFormValues(buyer: BuyerProfile): BuyerProfileForm {
  return {
    first_name: buyer.firstName,
    last_name: buyer.lastName,
    dni: buyer.dni ?? "",
    phone: buyer.phone ?? "",
    address: buyer.address ?? "",
  };
}

function buildPayload(values: BuyerProfileForm): BuyerProfileValues {
  const payload: BuyerProfileValues = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
  };
  const dni = values.dni.trim();
  const phone = values.phone.trim();
  const address = values.address.trim();

  if (dni) {
    payload.dni = dni;
  }

  if (phone) {
    payload.phone = phone;
  }

  if (address) {
    payload.address = address;
  }

  return payload;
}

export default function BuyerProfilePage() {
  const [form, setForm] = useState<BuyerProfileForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para editar tu perfil.");
      return;
    }

    getBuyerProfile(token)
      .then((response) => setForm(toFormValues(response.buyer)))
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar tu perfil",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getToken();

    if (!token) {
      setError("Inicia sesion para guardar cambios.");
      return;
    }

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Completa tu nombre y apellidos.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    updateBuyerProfile(token, buildPayload(form))
      .then((response) => {
        setForm(toFormValues(response.buyer));
        setSuccess("Perfil actualizado correctamente.");
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo actualizar tu perfil",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  return (
    <ProtectedPage role="buyer">
      {() => (
        <section className="site-shell">
          <div className="rounded-md border border-white/70 bg-white/86 p-6 shadow-soft md:p-8">
            <p className="eyebrow">Mi perfil</p>
            <h1 className="mt-3 text-4xl font-black text-ink">
              Bienvenido, {form.first_name || "comprador"}
            </h1>
            <p className="mt-3 max-w-2xl text-ink/64">
              Mantén tus datos personales listos para comprar con una entrega
              mas clara y cercana.
            </p>
          </div>

          {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
          {success && (
            <p className="mt-6 rounded-md bg-mineral/10 p-4 text-mineral">{success}</p>
          )}

          {isLoading ? (
            <div className="mt-8 h-80 animate-pulse rounded-md bg-white shadow-soft" />
          ) : (
            <form
              className="mt-8 grid gap-5 rounded-md bg-white p-6 shadow-soft md:grid-cols-2 md:p-8"
              onSubmit={handleSubmit}
            >
              <label className="grid gap-2 text-sm font-bold text-ink">
                Nombre
                <input
                  className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.first_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      first_name: event.target.value,
                    }))
                  }
                  placeholder="Tu nombre"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Apellidos
                <input
                  className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.last_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      last_name: event.target.value,
                    }))
                  }
                  placeholder="Tus apellidos"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                DNI
                <input
                  className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.dni}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dni: event.target.value,
                    }))
                  }
                  placeholder="Documento de identidad"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Telefono
                <input
                  className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+51 999 999 999"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">
                Direccion principal
                <textarea
                  className="form-field min-h-28 resize-y focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Distrito, calle, numero y referencia de entrega"
                />
                <span className="text-xs font-semibold text-ink/45">
                  La podras cambiar al crear un pedido si necesitas otra direccion.
                </span>
              </label>

              <div className="md:col-span-2">
                <button
                  className="primary-action w-full md:w-fit"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar perfil"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </ProtectedPage>
  );
}
