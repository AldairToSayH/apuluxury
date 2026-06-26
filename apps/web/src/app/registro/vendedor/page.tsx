"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError, apiClient } from "@/lib/apiClient";
import { saveToken } from "@/lib/auth";
import { routes } from "@/lib/routes";
import type { AuthResponse } from "@/types/api";

const sellerFields = [
  {
    name: "email",
    label: "Correo electronico",
    placeholder: "Correo electronico del negocio",
    type: "email",
  },
  {
    name: "password",
    label: "Contrasena",
    placeholder: "Crea una contrasena segura",
    type: "password",
  },
  {
    name: "commercial_name",
    label: "Nombre comercial",
    placeholder: "Nombre comercial de tu tienda",
    type: "text",
  },
  {
    name: "subdomain",
    label: "Subdominio",
    placeholder: "mi-tienda-1",
    type: "text",
    suffix: ".apuluxury.com",
    help: "Se usara como mi-tienda-1.apuluxury.com",
  },
  {
    name: "ruc",
    label: "RUC",
    placeholder: "RUC",
    type: "text",
  },
  {
    name: "phone",
    label: "Telefono",
    placeholder: "Celular o WhatsApp",
    type: "tel",
  },
  {
    name: "address",
    label: "Direccion",
    placeholder: "Direccion del taller o tienda",
    type: "text",
  },
  {
    name: "business_description",
    label: "Propuesta artesanal",
    placeholder: "Cuentanos que productos vendes",
    type: "text",
  },
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState("");
  const [subdomainFeedback, setSubdomainFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function normalizeSubdomain(value: string) {
    const withoutProtocol = value
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\.apuluxury\.com$/, "");
    const prefix = withoutProtocol.split(".")[0] ?? "";

    return prefix
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+/, "");
  }

  function handleSubdomainChange(value: string) {
    const nextValue = normalizeSubdomain(value);

    if (value.includes(".")) {
      setSubdomainFeedback("Escribe solo el prefijo; el dominio ya esta fijo.");
    } else if (/[^a-zA-Z0-9-]/.test(value)) {
      setSubdomainFeedback("Solo se permiten letras, numeros y guiones.");
    } else {
      setSubdomainFeedback("");
    }

    setSubdomain(nextValue);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const normalizedSubdomain = normalizeSubdomain(subdomain);

    if (!normalizedSubdomain || normalizedSubdomain.endsWith("-")) {
      setError("Escribe un subdominio valido, por ejemplo mi-tienda-1.");
      setIsLoading(false);
      return;
    }

    formData.set("subdomain", normalizedSubdomain);

    try {
      const response = await apiClient<AuthResponse>("/api/auth/register-seller", {
        method: "POST",
        body: Object.fromEntries(formData.entries()),
      });

      saveToken(response.token);
      setMessage("Tu cuenta de vendedor esta pendiente de aprobacion.");
      router.replace(routes.sellerDashboard);
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
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-md border border-white/70 bg-white/[0.92] p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
          Vende en APU LUXURY
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">Registra tu tienda</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Completa tus datos para mostrar tus productos a compradores que buscan
          moda y artesania premium.
        </p>
        <p className="mt-4 rounded-md border border-mineral/15 bg-mineral/[0.07] px-4 py-3 text-sm font-semibold leading-6 text-ink/62">
          Elige solo el prefijo de tu tienda. Nosotros agregamos el dominio de
          APU LUXURY automaticamente.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {sellerFields.map((field) => (
            <label className="grid gap-2 text-sm font-bold text-ink/72" key={field.name}>
              {field.label}
              {"suffix" in field ? (
                <div className="flex overflow-hidden rounded-md border border-ink/10 bg-white focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/20">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-ink placeholder:text-ink/35 focus:outline-none"
                    name={field.name}
                    placeholder={field.placeholder}
                    type={field.type}
                    value={subdomain}
                    onChange={(event) => handleSubdomainChange(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="url"
                    maxLength={160}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    spellCheck={false}
                    title="Usa solo letras minusculas, numeros y guiones. No escribas puntos ni .com"
                    required
                  />
                  <span className="flex shrink-0 items-center border-l border-ink/10 bg-cloud px-3 text-sm font-black text-mineral">
                    {field.suffix}
                  </span>
                </div>
              ) : (
                <input
                  className="form-field"
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  required
                />
              )}
              {"help" in field && (
                <span className="text-xs font-semibold text-ink/45">
                  {field.help}
                </span>
              )}
              {"suffix" in field && subdomainFeedback && (
                <span className="text-xs font-bold text-copper">
                  {subdomainFeedback}
                </span>
              )}
              {"suffix" in field && subdomain && (
                <span className="rounded-md bg-cloud px-3 py-2 text-xs font-black text-mineral">
                  Vista previa: {subdomain}
                  {field.suffix}
                </span>
              )}
            </label>
          ))}
          {message && <p className="text-sm font-medium text-mineral md:col-span-2">{message}</p>}
          {error && <p className="text-sm font-medium text-red-700 md:col-span-2">{error}</p>}
          <button
            className="rounded-full bg-ink px-5 py-3 font-bold text-white shadow-sm transition hover:bg-copper disabled:opacity-60 md:col-span-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Registrando tienda..." : "Crear cuenta vendedor"}
          </button>
        </form>
      </div>
    </section>
  );
}
