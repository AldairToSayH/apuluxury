# APU LUXURY

APU LUXURY es un SaaS e-commerce marketplace multi-tenant para vendedores, artesanos, emprendedores y compradores. El frontend consume una API REST desacoplada, y el backend es la autoridad de negocio, seguridad, roles y tenant.

## Stack

- Monorepo con PNPM.
- Frontend: Next.js App Router, React, TypeScript y Tailwind CSS.
- Backend: Node.js, Express, TypeScript y `pg`.
- Base de datos local: PostgreSQL.
- API local: `http://localhost:4000`.
- Web local: `http://localhost:3000`.

## Estructura

```txt
apps/
  api/       Backend Express + TypeScript
  web/       Frontend Next.js
database/
  migrations/
  seeds/
docs/
```

## Setup Local

1. Instalar dependencias desde la raiz:

```bash
pnpm install
```

2. Crear archivos de entorno desde los ejemplos:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Ajustar `apps/api/.env` con la credencial real local de PostgreSQL.

4. Crear la base de datos local:

```sql
CREATE DATABASE apu_luxury_dev;
```

## Variables De Entorno

Backend (`apps/api/.env`):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/apu_luxury_dev
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=change_me
```

Frontend (`apps/web/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

No subir archivos `.env` reales al repositorio. Solo los archivos `*.example` deben quedar versionados.

## Base De Datos

Ejecutar las migraciones en orden de nombre dentro de `database/migrations`:

1. `001_init_extensions.sql`
2. `002_create_users.sql`
3. `003_create_buyers.sql`
4. `004_create_sellers.sql`
5. `005_create_categories.sql`
6. `006_create_products.sql`
7. `007_create_product_images.sql`
8. `008_create_inventory_movements.sql`
9. `009_create_carts.sql`
10. `010_create_cart_items.sql`
11. `011_create_orders.sql`
12. `012_create_seller_orders.sql`
13. `013_create_order_items.sql`
14. `014_create_order_status_history.sql`
15. `015_create_stores_and_auth_profile_fields.sql`

Despues ejecutar seeds, tambien en orden de nombre:

1. `001_seed_initial_data.sql`
2. `002_seed_product_images.sql`

Puedes ejecutarlos desde pgAdmin Query Tool o con `psql` apuntando a `apu_luxury_dev`.

## Ejecutar El Proyecto

Backend:

```bash
pnpm dev:api
```

Frontend:

```bash
pnpm dev:web
```

Ambos en paralelo:

```bash
pnpm dev
```

## Comandos Comunes

```bash
pnpm typecheck
pnpm build
pnpm --filter @apu-luxury/api typecheck
pnpm --filter @apu-luxury/api build
pnpm --filter @apu-luxury/web typecheck
pnpm --filter @apu-luxury/web build
```

## Modulos Implementados

Backend:

- Health.
- Auth con JWT.
- Sellers.
- Admin seller approval.
- Products.
- Product images con URL publica.
- Catalog.
- Categories.
- Cart.
- Orders sin pagos.
- Admin product moderation.
- Admin orders.

Frontend:

- Home.
- Login.
- Registro comprador y vendedor.
- Catalogo y detalle de producto.
- Dashboards buyer, seller y admin.
- CRUD de productos del vendedor.
- Imagenes de productos del vendedor.
- Carrito de comprador.
- Checkout y pedidos de comprador.
- Pedidos recibidos del vendedor.
- UI admin para sellers, products y orders.

Mas detalles en `docs/architecture.md`, `docs/api-overview.md` y `docs/local-development.md`.
