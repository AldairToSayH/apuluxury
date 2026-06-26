# Desarrollo Local

## Requisitos

- Node.js compatible con el workspace.
- PNPM.
- PostgreSQL local.
- pgAdmin opcional para ejecutar SQL manualmente.

## Instalacion

Desde la raiz del monorepo:

```bash
pnpm install
```

## Entorno

Backend:

```bash
cp apps/api/.env.example apps/api/.env
```

Frontend:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Editar `apps/api/.env` con las credenciales locales reales. No subir `.env` reales.

## Base De Datos

Crear la base local:

```sql
CREATE DATABASE apu_luxury_dev;
```

Ejecutar migraciones en orden de nombre desde `database/migrations`, luego seeds en orden de nombre desde `database/seeds`.

## Servidores

API:

```bash
pnpm dev:api
```

Web:

```bash
pnpm dev:web
```

Ambos:

```bash
pnpm dev
```

## Validacion

```bash
pnpm --filter @apu-luxury/api typecheck
pnpm --filter @apu-luxury/api build
pnpm --filter @apu-luxury/web typecheck
pnpm --filter @apu-luxury/web build
```

Si `next build` muestra errores raros dentro de `.next/server/*.js` mientras el servidor dev esta activo, detener el proceso que usa el puerto `3000` y repetir el build.

## Lockfiles

El lockfile intencional del monorepo es:

```txt
pnpm-lock.yaml
```

No crear lockfiles dentro de `apps/api` ni `apps/web`. Next.js tiene configurado `outputFileTracingRoot` para usar la raiz del monorepo.
