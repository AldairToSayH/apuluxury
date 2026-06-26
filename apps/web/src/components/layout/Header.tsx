"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  getCurrentUser,
  logout,
  onAuthChange,
} from "@/lib/auth";
import { imageAssets } from "@/lib/imageAssets";
import { routes } from "@/lib/routes";
import type { ApiUser, MeResponse } from "@/types/api";

const navItems = [
  { href: routes.home, label: "Inicio" },
  { href: routes.catalog, label: "Catalogo" },
  { href: routes.stores, label: "Ver tiendas" },
  { href: routes.trackOrder, label: "Rastrear pedido" },
  { href: "/#sobre-nosotros", label: "Sobre nosotros" },
];

function accountName(session: MeResponse | null) {
  if (!session) {
    return "";
  }

  if (session.user.role === "buyer" && session.buyer) {
    return session.buyer.firstName;
  }

  if (session.user.role === "seller" && session.seller) {
    return session.seller.commercialName;
  }

  if (session.user.role === "admin") {
    return "Administrador";
  }

  return session.user.email.split("@")[0] || "Cuenta";
}

export function Header() {
  const pathname = usePathname();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isAtTop, setIsAtTop] = useState(pathname === routes.home);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const user: ApiUser | null = session?.user ?? null;
  const name = accountName(session);

  useEffect(() => {
    const syncUser = () => {
      getCurrentUser()
        .then((currentSession) => setSession(currentSession))
        .catch(() => setSession(null));
    };

    syncUser();

    return onAuthChange(syncUser);
  }, []);

  useEffect(() => {
    setIsAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const isHome = pathname === routes.home;

    const handleScroll = () => {
      setIsAtTop(isHome && window.scrollY < 32);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    setIsSearchOpen(false);

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const transparentHeader = isAtTop;
  const subtleButtonClass = transparentHeader
    ? "border-white/20 bg-white/[0.12] text-white hover:bg-white/[0.18]"
    : "border-ink/15 bg-white text-ink hover:border-copper/35";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const query = String(form.get("q") ?? "").trim();

    if (!query) {
      return;
    }

    setIsSearchOpen(false);
    setIsMenuOpen(false);
    window.location.href = `${routes.catalog}?q=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
          transparentHeader
            ? "border-transparent bg-transparent text-white shadow-none backdrop-blur-0"
            : "border-white/60 bg-white/[0.92] text-ink shadow-[0_18px_45px_rgba(23,20,18,0.10)] backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-3.5">
          <Link
            href={routes.home}
            className={`brand-font text-xl font-black tracking-wide ${
              transparentHeader ? "text-white" : "text-ink"
            }`}
          >
            APU LUXURY
          </Link>

          <nav
            className={`hidden items-center gap-1 rounded-full border p-1 text-sm font-semibold shadow-sm transition lg:flex ${
              transparentHeader
                ? "border-white/20 bg-white/[0.12] text-white/[0.82] backdrop-blur-md"
                : "border-ink/10 bg-white/[0.72] text-ink/[0.68]"
            }`}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  transparentHeader
                    ? "hover:bg-white/[0.16] hover:text-white"
                    : "hover:bg-cloud hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition xl:flex ${
                transparentHeader
                  ? "border-white/20 bg-white/[0.12] text-white hover:bg-white/[0.18]"
                  : "border-mineral/15 bg-mineral/[0.08] text-ink hover:border-mineral/30 hover:bg-mineral/[0.12]"
              }`}
              href="https://wa.me/51971328247"
              aria-label="Llamar a soporte APU LUXURY"
            >
              <span className={transparentHeader ? "text-white/[0.78]" : "text-ink/[0.58]"}>
                Necesitas ayuda?
              </span>
              <span
                className={`grid size-7 place-items-center rounded-full ${
                  transparentHeader ? "bg-white text-ink" : "bg-mineral text-white"
                }`}
              >
                <Image alt="" height={15} src={imageAssets.icons.phone} width={15} />
              </span>
              <span className="font-bold">+51 917328247</span>
            </a>

            <button
              className={`hidden size-10 place-items-center rounded-full border shadow-sm transition lg:grid ${subtleButtonClass}`}
              type="button"
              aria-label="Buscar"
              title="Buscar"
              onClick={() => setIsSearchOpen((current) => !current)}
            >
              <Image alt="" height={18} src={imageAssets.icons.search} width={18} />
            </button>

            {user ? (
              <>
                {user.role === "buyer" && (
                  <Link
                    className={`hidden rounded-full border px-4 py-2 text-sm font-semibold transition lg:inline ${subtleButtonClass}`}
                    href={routes.buyerCart}
                  >
                    Carrito
                  </Link>
                )}
                <div className="relative hidden lg:block">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-mineral px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ink"
                    type="button"
                    aria-expanded={isAccountOpen}
                    onClick={() => setIsAccountOpen((current) => !current)}
                  >
                    <Image alt="" height={16} src={imageAssets.icons.user} width={16} />
                    Hola, {name}
                  </button>
                  {isAccountOpen && (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] grid min-w-52 gap-1 rounded-md border border-ink/10 bg-white p-2 text-sm font-semibold text-ink shadow-[0_18px_45px_rgba(23,20,18,0.16)]">
                      {user.role === "buyer" && (
                        <>
                          <Link
                            className="rounded-md px-3 py-2 transition hover:bg-cloud"
                            href={routes.buyerProfile}
                          >
                            Mi cuenta
                          </Link>
                          <Link
                            className="rounded-md px-3 py-2 transition hover:bg-cloud"
                            href={routes.buyerOrders}
                          >
                            Mis pedidos
                          </Link>
                        </>
                      )}
                      {user.role === "seller" && (
                        <Link
                          className="rounded-md px-3 py-2 transition hover:bg-cloud"
                          href={routes.sellerDashboard}
                        >
                          Dashboard vendedor
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          className="rounded-md px-3 py-2 transition hover:bg-cloud"
                          href={routes.adminDashboard}
                        >
                          Dashboard admin
                        </Link>
                      )}
                      <button
                        className="rounded-md px-3 py-2 text-left transition hover:bg-cloud"
                        type="button"
                        onClick={logout}
                      >
                        Cerrar sesion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                className={`hidden rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition lg:inline-flex ${
                  transparentHeader
                    ? "bg-white text-ink hover:bg-maize"
                    : "bg-ink text-white hover:bg-copper"
                }`}
                href={routes.login}
              >
                Login
              </Link>
            )}

            <button
              className={`grid size-10 place-items-center rounded-full border shadow-sm transition lg:hidden ${subtleButtonClass}`}
              type="button"
              aria-label="Abrir menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <span className="grid w-4 gap-1" aria-hidden="true">
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div
            className={`border-t px-6 py-4 ${
              transparentHeader
                ? "border-white/15 bg-ink/76 text-white backdrop-blur-xl"
                : "border-ink/10 bg-white/96 text-ink"
            }`}
          >
            <form
              className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row"
              onSubmit={handleSearch}
            >
              <input
                autoFocus
                className="form-field"
                name="q"
                placeholder="Busca chalina negra, poncho, alpaca..."
                type="search"
              />
              <button className="primary-action" type="submit">
                Buscar
              </button>
            </form>
          </div>
        )}

        {isMenuOpen && (
          <div className="fixed inset-0 z-[999] bg-ink/62 text-white backdrop-blur-md animate-[apuDrawerOverlay_180ms_ease-out] lg:hidden">
            <div className="ml-auto flex h-dvh max-h-dvh w-[min(23rem,88vw)] flex-col bg-[#18120f] shadow-[0_28px_90px_rgba(0,0,0,0.42)] animate-[apuDrawerPanel_240ms_ease-out]">
              <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-6 py-5">
                <Link
                  className="brand-font text-2xl font-black tracking-wide text-white"
                  href={routes.home}
                  onClick={() => setIsMenuOpen(false)}
                >
                  APU LUXURY
                </Link>
                <button
                  className="rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/[0.14]"
                  type="button"
                  aria-label="Cerrar menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <div className="grid flex-1 gap-5 overflow-y-auto px-6 py-6">
                <div className="grid gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">
                    Cuenta
                  </p>
                  {user ? (
                    <>
                      <p className="text-sm font-bold text-white/70">Hola, {name}</p>
                      {user.role === "buyer" && (
                        <>
                          <Link
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-maize px-5 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-white"
                            href={routes.buyerProfile}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Image alt="" height={17} src={imageAssets.icons.user} width={17} />
                            Mi cuenta
                          </Link>
                          <Link
                            className="rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-center text-sm font-black text-white transition hover:bg-white/[0.14]"
                            href={routes.buyerOrders}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Mis pedidos
                          </Link>
                        </>
                      )}
                      {user.role === "seller" && (
                        <Link
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-maize px-5 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-white"
                          href={routes.sellerDashboard}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard vendedor
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-maize px-5 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-white"
                          href={routes.adminDashboard}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard admin
                        </Link>
                      )}
                      <button
                        className="rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/[0.14]"
                        type="button"
                        onClick={logout}
                      >
                        Cerrar sesion
                      </button>
                    </>
                  ) : (
                    <Link
                      className="rounded-full bg-maize px-5 py-2.5 text-center text-sm font-black text-ink shadow-sm transition hover:bg-white"
                      href={routes.login}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>

                <nav className="grid gap-3 border-t border-white/10 pt-5 text-base font-semibold">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">
                    Explorar
                  </p>
                  {navItems.map((item) => (
                    <Link
                      className="text-white/90 transition hover:text-maize"
                      href={item.href}
                      key={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <section className="grid gap-3 border-t border-white/10 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-maize">
                    Ayuda
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-maize text-ink">
                      <Image alt="" height={18} src={imageAssets.icons.phone} width={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white/55">Necesitas ayuda?</p>
                      <a
                        className="text-lg font-black text-white hover:text-maize"
                        href="https://wa.me/51971328247"
                      >
                        +51 917328247
                      </a>
                    </div>
                  </div>
                </section>

                <form
                  className="grid gap-3 border-t border-white/10 pt-5"
                  onSubmit={handleSearch}
                >
                  <label
                    className="text-xs font-black uppercase tracking-[0.22em] text-maize"
                    htmlFor="mobile-product-search"
                  >
                    Buscar prendas
                  </label>
                  <input
                    className="w-full rounded-md border border-white/12 bg-white/[0.08] px-4 py-3 text-white placeholder:text-white/38 focus:border-maize focus:outline-none focus:ring-2 focus:ring-maize/20"
                    id="mobile-product-search"
                    name="q"
                    placeholder="Chalina negra, poncho, alpaca..."
                    type="search"
                  />
                  <button
                    className="rounded-full bg-maize px-5 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-white"
                    type="submit"
                  >
                    Buscar
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </header>

      {pathname !== routes.home && <div className="h-[68px]" aria-hidden="true" />}
    </>
  );
}
