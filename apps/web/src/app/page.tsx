import Image from "next/image";
import Link from "next/link";

import { imageAssets } from "@/lib/imageAssets";
import { routes } from "@/lib/routes";

const categoryCards = [
  {
    title: "Textiles y prendas de vestir",
    image: imageAssets.categories.textiles,
  },
  {
    title: "Joyeria y orfebreria",
    image: imageAssets.categories.joyeria,
  },
  {
    title: "Ceramica artesanal",
    image: imageAssets.categories.ceramica,
  },
  {
    title: "Decoracion y hogar",
    image: imageAssets.categories.decoracion,
  },
  {
    title: "Souvenirs y recuerdos turisticos",
    image: imageAssets.categories.souvenirs,
  },
  {
    title: "Accesorios y moda",
    image: imageAssets.categories.accesorios,
  },
];

const trustItems = [
  {
    title: "Productos con origen",
    text: "Piezas con identidad andina, materiales nobles y oficio visible.",
  },
  {
    title: "Vendedores seleccionados",
    text: "Emprendedores y artesanos preparados para vender con confianza.",
  },
  {
    title: "Compra segura",
    text: "Flujos claros para carrito, checkout y seguimiento de pedidos.",
  },
  {
    title: "Moda andina contemporanea",
    text: "Tradicion textil presentada con una experiencia comercial moderna.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden bg-ink text-white">
        <Image
          alt="Moda andina premium de APU LUXURY"
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          sizes="100vw"
          src={imageAssets.hero}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,20,18,0.88),rgba(23,20,18,0.48),rgba(23,20,18,0.18))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cloud/80 via-cloud/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-6 pb-24 pt-28">
          <div className="max-w-3xl">
            <p className="eyebrow text-maize">Marketplace artesanal de Cusco</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] md:text-7xl">
              APU LUXURY
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/84">
              Moda andina premium, textiles de alpaca y piezas artesanales
              creadas por manos peruanas para compradores que valoran origen,
              calidad y belleza.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={routes.catalog} className="primary-action bg-maize text-ink hover:bg-white">
                Comprar ahora
              </Link>
              <Link
                href={routes.sellerRegister}
                className="secondary-action border-white/35 bg-white/10 text-white hover:bg-white hover:text-ink"
              >
                Quiero vender
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="section-heading">
            <p className="eyebrow">Categorias</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
              Oficios, materiales y estilo andino
            </h2>
            <p className="mt-4 text-ink/64">
              Explora piezas pensadas para vestir, regalar y decorar con
              identidad peruana.
            </p>
          </div>
          <Link className="secondary-action" href={routes.catalog}>
            Ver catalogo
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((category) => (
            <article
              className="group relative aspect-[4/3] overflow-hidden rounded-md shadow-soft"
              key={category.title}
            >
              <Image
                alt={category.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={category.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/78 via-ink/16 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-2xl font-black leading-tight text-white">
                  {category.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white/82">
        <div className="site-shell">
          <div className="grid gap-5 md:grid-cols-4">
            {trustItems.map((item) => (
              <article className="premium-surface p-5" key={item.title}>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-copper">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink/66">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre-nosotros" className="bg-cloud">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md shadow-soft">
            <Image
              alt="Artesana tejiendo en Cusco"
              className="h-full w-full object-cover"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={imageAssets.about}
            />
          </div>
          <div>
            <p className="eyebrow">Sobre nosotros</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
              Una vitrina premium para el talento artesanal de Cusco
            </h2>
            <p className="mt-6 text-lg leading-8 text-ink/70">
              APU LUXURY conecta compradores con creadores que trabajan fibras
              de alpaca, telares, ceramica, joyeria y accesorios con identidad
              andina. Cada pantalla esta pensada para que el producto sea el
              protagonista y el vendedor pueda crecer con una presencia digital
              confiable.
            </p>
            <div className="mt-8 grid gap-4 text-sm font-black text-ink sm:grid-cols-3">
              <span className="premium-surface p-4">Hecho a mano</span>
              <span className="premium-surface p-4">Origen andino</span>
              <span className="premium-surface p-4">Calidad premium</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
