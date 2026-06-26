"use client";

import { FormEvent, useEffect, useState } from "react";

import { ProtectedPage } from "@/components/ui/ProtectedPage";
import { ApiError } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";
import {
  getSellerProfile,
  updateSellerProfile,
  type SellerProfileValues,
} from "@/lib/sellerApi";
import type { SellerProfile, SellerValidationStatus } from "@/types/api";

type SellerProfileForm = {
  commercial_name: string;
  phone: string;
  address: string;
  business_description: string;
};

const emptyForm: SellerProfileForm = {
  commercial_name: "",
  phone: "",
  address: "",
  business_description: "",
};

const statusLabels: Record<SellerValidationStatus, string> = {
  pending: "Pendiente de aprobacion",
  approved: "Aprobado",
  rejected: "Rechazado",
  suspended: "Suspendido",
};

function toFormValues(seller: SellerProfile): SellerProfileForm {
  return {
    commercial_name: seller.commercialName,
    phone: seller.phone ?? "",
    address: seller.address ?? "",
    business_description: seller.businessDescription ?? "",
  };
}

function buildPayload(values: SellerProfileForm): SellerProfileValues {
  const payload: SellerProfileValues = {
    commercial_name: values.commercial_name.trim(),
  };

  const phone = values.phone.trim();
  const address = values.address.trim();
  const description = values.business_description.trim();

  if (phone) {
    payload.phone = phone;
  }

  if (address) {
    payload.address = address;
  }

  if (description) {
    payload.business_description = description;
  }

  return payload;
}

export default function SellerProfilePage() {
  const [form, setForm] = useState<SellerProfileForm>(emptyForm);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsLoading(false);
      setError("Inicia sesion para editar tu tienda.");
      return;
    }

    getSellerProfile(token)
      .then((response) => {
        setSeller(response.seller);
        setForm(toFormValues(response.seller));
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo cargar el perfil de tu tienda",
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

    if (!form.commercial_name.trim()) {
      setError("Escribe el nombre comercial de tu tienda.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    updateSellerProfile(token, buildPayload(form))
      .then((response) => {
        setSeller(response.seller);
        setForm(toFormValues(response.seller));
        setSuccess("Perfil de tienda actualizado correctamente.");
      })
      .catch((requestError) =>
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : "No se pudo actualizar el perfil de tu tienda",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  return (
    <ProtectedPage role="seller">
      {() => (
        <section className="space-y-6">
          <div className="rounded-md border border-white/70 bg-white/86 p-6 shadow-soft md:p-8">
            <p className="eyebrow">Perfil de tienda</p>
            <h1 className="mt-3 text-4xl font-black text-ink">
              Cuida como se presenta tu marca
            </h1>
            <p className="mt-3 max-w-2xl text-ink/64">
              Actualiza los datos seguros de tu tienda. La validacion y los
              identificadores internos siguen protegidos por el backend.
            </p>
          </div>

          {error && <p className="rounded-md bg-red-50 p-4 text-red-700">{error}</p>}
          {success && (
            <p className="rounded-md bg-mineral/10 p-4 text-mineral">{success}</p>
          )}

          {isLoading ? (
            <div className="h-96 animate-pulse rounded-md bg-white shadow-soft" />
          ) : (
            <form
              className="grid gap-5 rounded-md bg-white p-6 shadow-soft md:p-8"
              onSubmit={handleSubmit}
            >
              <label className="grid gap-2 text-sm font-bold text-ink">
                Nombre comercial de tu tienda
                <input
                  className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.commercial_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      commercial_name: event.target.value,
                    }))
                  }
                  placeholder="Ejemplo: Taller Andino Cusco"
                  required
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Telefono de contacto
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

                <label className="grid gap-2 text-sm font-bold text-ink">
                  Direccion del taller o tienda
                  <input
                    className="form-field focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Ciudad, distrito o referencia"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Describe tu propuesta artesanal
                <textarea
                  className="form-field min-h-36 resize-y focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  value={form.business_description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      business_description: event.target.value,
                    }))
                  }
                  placeholder="Cuenta que materiales, tecnicas o inspiracion hacen especial tu tienda."
                />
              </label>

              {seller && (
                <p className="rounded-md bg-cloud p-4 text-sm font-semibold text-ink/70">
                  Estado actual de validacion:{" "}
                  {statusLabels[seller.validationStatus]}
                </p>
              )}

              <button
                className="primary-action w-full md:w-fit"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar perfil"}
              </button>
            </form>
          )}
        </section>
      )}
    </ProtectedPage>
  );
}
