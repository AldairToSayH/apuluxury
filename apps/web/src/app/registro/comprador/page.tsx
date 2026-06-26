"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError, apiClient } from "@/lib/apiClient";
import { saveToken } from "@/lib/auth";
import { routes } from "@/lib/routes";
import type { AuthResponse } from "@/types/api";

const buyerFields = [
  {
    name: "email",
    label: "Correo electronico",
    placeholder: "Correo electronico",
    type: "email",
  },
  {
    name: "password",
    label: "Contrasena",
    placeholder: "Crea una contrasena segura",
    type: "password",
  },
  {
    name: "first_name",
    label: "Nombres",
    placeholder: "Nombres",
    type: "text",
  },
  {
    name: "last_name",
    label: "Apellidos",
    placeholder: "Apellidos",
    type: "text",
  },
  {
    name: "dni",
    label: "DNI o documento",
    placeholder: "DNI o documento",
    type: "text",
  },
  {
    name: "phone",
    label: "Telefono",
    placeholder: "Celular de contacto",
    type: "tel",
  },
];

export default function BuyerRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiClient<AuthResponse>("/api/auth/register-buyer", {
        method: "POST",
        body: Object.fromEntries(formData.entries()),
      });

      saveToken(response.token);
      router.replace(routes.buyerDashboard);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo crear la cuenta",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-md border border-white/70 bg-white/[0.92] p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
          Compra artesanal
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">Crea tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Registra tus datos para comprar piezas andinas y seguir tus pedidos.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {buyerFields.map((field) => (
            <label className="grid gap-2 text-sm font-bold text-ink/72" key={field.name}>
              {field.label}
              <input
                className="form-field"
                name={field.name}
                placeholder={field.placeholder}
                type={field.type}
                required
              />
            </label>
          ))}
          {error && <p className="text-sm font-medium text-red-700 md:col-span-2">{error}</p>}
          <button
            className="rounded-full bg-ink px-5 py-3 font-bold text-white shadow-sm transition hover:bg-copper disabled:opacity-60 md:col-span-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </section>
  );
}
