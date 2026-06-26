# Arquitectura

APU LUXURY usa una arquitectura desacoplada:

- `apps/web` contiene la experiencia web en Next.js App Router.
- `apps/api` contiene la API REST en Express.
- PostgreSQL es la fuente de verdad para usuarios, tenants, productos, carrito y pedidos.
- El frontend nunca envia `seller_id` ni `tenant_id`; el backend los resuelve desde JWT, rol y estado del vendedor.

## Backend

La API sigue una estructura modular:

```txt
src/
  config/        Entorno y conexion PostgreSQL
  middlewares/   Auth, roles, tenant, errores y logs
  modules/       Dominios de negocio
  routes/        Registro central de rutas /api
  app.ts         Configuracion Express
  server.ts      Arranque HTTP
```

Patron esperado por modulo:

- `*.routes.ts`: define rutas HTTP y middlewares.
- `*.controller.ts`: adapta request/response.
- `*.service.ts`: concentra reglas de negocio.
- `*.repository.ts`: ejecuta SQL con `pg`.
- `*.schemas.ts`: valida payloads cuando aplica.

## Frontend

El frontend usa:

- App Router para rutas.
- Componentes por dominio en `src/components`.
- Clientes API en `src/lib`.
- Tipos compartidos del frontend en `src/types/api.ts`.
- Proteccion client-side por rol para UX; el backend sigue siendo la autoridad real.

## Multi-Tenant Y Roles

Roles principales:

- `buyer`: compra, carrito y pedidos propios.
- `seller`: gestiona productos y pedidos recibidos.
- `admin`: modera vendedores, productos y pedidos.

El control fuerte vive en backend con middleware de auth, rol y tenant. Las pantallas del frontend redirigen por rol para evitar rutas equivocadas en la navegacion normal.

## Fuera Del Alcance Actual

No estan implementados pagos, integracion con shipping providers, invoices, almacenamiento real de imagenes ni ORM. Las imagenes usan URLs publicas.
