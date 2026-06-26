import Image from "next/image";
import Link from "next/link";

import { imageAssets } from "@/lib/imageAssets";
import { routes } from "@/lib/routes";

const buyLinks = [
  { href: routes.catalog, label: "Catalogo" },
  { href: routes.stores, label: "Ver tiendas" },
  { href: routes.trackOrder, label: "Rastrear pedido" },
  { href: routes.buyerCart, label: "Mi carrito" },
];

const sellerLinks = [
  { href: routes.sellerRegister, label: "Quiero vender" },
  { href: routes.login, label: "Iniciar sesion" },
  { href: routes.sellerDashboard, label: "Dashboard vendedor" },
  { href: routes.sellerProfile, label: "Perfil de tienda" },
];

const socialLinks = [
  { src: imageAssets.icons.instagram, alt: "Instagram" },
  { src: imageAssets.icons.facebook, alt: "Facebook" },
  { src: imageAssets.icons.mail, alt: "Correo" },
];

const paymentIcons = [
  { src: "/image/icons/pago-por-pos-yape.svg", alt: "Yape" },
  { src: "/image/icons/pago-por-pos-plin.svg", alt: "Plin" },
  { src: "/image/icons/pos-visa.svg", alt: "Visa" },
  { src: "/image/icons/pos-mastercard.svg", alt: "Mastercard" },
  { src: "/image/icons/pos-de-venta-amex.svg", alt: "American Express" },
  { src: "/image/icons/pos-diners.svg", alt: "Diners Club" },
  { src: "/image/icons/pago-en-pos-apple-pay.svg", alt: "Apple Pay" },
  { src: "/image/icons/pago-en-pos-google-pay.svg", alt: "Google Pay" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        fill
        sizes="100vw"
        src={imageAssets.footer}
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(23,20,18,0.98),rgba(30,22,17,0.94),rgba(56,38,27,0.9))]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.95fr_1fr]">
        <section>
          <p className="brand-font text-3xl font-black tracking-wide">APU LUXURY</p>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
            Marketplace de moda andina premium, textiles de alpaca y piezas
            artesanales creadas por vendedores seleccionados de Cusco.
          </p>

          <div className="mt-7 flex items-center gap-3">
            {socialLinks.map((icon) => (
              <span
                className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.06]"
                key={icon.alt}
              >
                <Image alt={icon.alt} height={19} src={icon.src} width={19} />
              </span>
            ))}
          </div>
        </section>

        <FooterColumn title="Comprar" links={buyLinks} />
        <FooterColumn title="Vendedores" links={sellerLinks} />

        <section>
          <h2 className="ui-font text-sm font-black uppercase tracking-[0.18em] text-maize">
            Contacto
          </h2>
          <div className="mt-5 grid gap-4 text-sm text-white/70">
            <div>
              <p className="font-black text-white">¿Necesitas ayuda?</p>
              <a
                className="mt-2 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 font-black text-white transition hover:border-maize/45 hover:text-maize"
                href="https://wa.me/51971328247"
              >
                <Image alt="" height={16} src={imageAssets.icons.phone} width={16} />
                +51 917328247
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Image alt="" height={17} src={imageAssets.icons.location} width={17} />
              <span>Cusco, Peru</span>
            </div>
          </div>
        </section>
      </div>

      <div className="relative border-t border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-white/52">
            © 2026 APU LUXURY. Todos los derechos reservados.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="ui-font text-xs font-black uppercase tracking-[0.16em] text-maize">
              Metodos de pago
            </p>
            <div className="flex flex-wrap gap-2">
              {paymentIcons.map((icon) => (
                <span
                  className="grid h-9 min-w-12 place-items-center rounded-full bg-white px-3 shadow-sm"
                  key={icon.alt}
                >
                  <Image alt={icon.alt} height={20} src={icon.src} width={34} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <section>
      <h2 className="ui-font text-sm font-black uppercase tracking-[0.18em] text-maize">
        {title}
      </h2>
      <div className="mt-5 grid gap-3 text-sm text-white/66">
        {links.map((link) => (
          <Link
            className="transition hover:text-maize"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
