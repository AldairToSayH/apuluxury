"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError, apiClient } from "@/lib/apiClient";
import { redirectPathForUser, saveToken } from "@/lib/auth";
import { routes } from "@/lib/routes";
import type { AuthResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiClient<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      });

      saveToken(response.token);
      router.replace(redirectPathForUser(response.user));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo iniciar sesion",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-md border border-white/70 bg-white/[0.92] p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
          Bienvenido
        </p>
        <h1 className="mt-2 text-3xl font-black text-ink">Inicia sesion</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Accede a tu cuenta para comprar o vender en APU LUXURY.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-ink/72">
            Correo electronico
            <input
              className="form-field"
              name="email"
              placeholder="tu@email.com"
              type="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink/72">
            Contrasena
            <input
              className="form-field"
              name="password"
              placeholder="Ingresa tu contrasena"
              type="password"
              required
            />
          </label>
          {error && <p className="text-sm font-medium text-red-700">{error}</p>}
          <button
            className="w-full rounded-full bg-ink px-5 py-3 font-bold text-white shadow-sm transition hover:bg-copper disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-ink/38">
          <span className="h-px flex-1 bg-ink/10" />
          o
          <span className="h-px flex-1 bg-ink/10" />
        </div>
        <a
          className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:border-copper/40 hover:bg-cloud"
          href={`${API_URL}/api/auth/google`}
        >
          <span className="grid size-5 place-items-center rounded-full bg-white text-sm font-black text-copper">
            G
          </span>
          Continuar con Google
        </a>
        <div className="mt-6 flex justify-between gap-4 text-sm font-semibold text-mineral">
          <Link href={routes.buyerRegister}>Crear cuenta comprador</Link>
          <Link href={routes.sellerRegister}>Quiero vender</Link>
        </div>
      </div>
    </section>
  );
}
