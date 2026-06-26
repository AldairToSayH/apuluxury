# APU LUXURY Agent Notes

Estas notas existen para evitar trabajo repetido en futuras sesiones de Codex.

## Proyecto

- Monorepo con PNPM.
- Backend: `apps/api`, Node.js + Express + TypeScript + `pg`.
- Frontend: `apps/web`, Next.js App Router + React + TypeScript + Tailwind.
- Base de datos local: PostgreSQL `apu_luxury_dev`.
- API local esperada: `http://localhost:4000`.
- Web local esperada: `http://localhost:3000`.

## Comandos Confiables

Ejecutar desde la raiz `C:\Users\elald\Desktop\apu-luxury-new`.

- Backend dev: `pnpm --filter @apu-luxury/api dev`
- Backend typecheck: `pnpm --filter @apu-luxury/api typecheck`
- Backend build: `pnpm --filter @apu-luxury/api build`
- Frontend dev: `pnpm --filter @apu-luxury/web dev`
- Frontend typecheck: `pnpm --filter @apu-luxury/web typecheck`
- Frontend build: `pnpm --filter @apu-luxury/web build`

Si `next build` falla con errores raros de `.next/server/*.js` mientras el dev server esta activo, parar primero el proceso que escucha en el puerto `3000` y repetir el build. Ya ocurrio por competencia sobre `.next`, no necesariamente por bug de codigo.

## Estado Ya Implementado

Backend existente y funcional:

- Auth
- Sellers
- Admin sellers
- Products
- Product images por URL publica
- Catalog
- Categories
- Cart
- Orders
- Admin product moderation
- Health endpoint

Frontend existente y funcional:

- Home
- Login
- Registro comprador
- Registro vendedor
- Catalogo
- Detalle de producto
- Dashboard comprador
- Dashboard vendedor
- Dashboard admin
- Redireccion por rol
- Gestion de productos del vendedor
- UI de carrito de comprador
- UI de checkout y pedidos de comprador
- UI de pedidos recibidos del vendedor
- UI de administracion

## UI De Productos Del Vendedor

Archivos principales:

- `apps/web/src/app/vendedor/productos/page.tsx`
- `apps/web/src/app/vendedor/productos/nuevo/page.tsx`
- `apps/web/src/app/vendedor/productos/[id]/page.tsx`
- `apps/web/src/app/vendedor/productos/[id]/editar/page.tsx`
- `apps/web/src/app/vendedor/productos/[id]/imagenes/page.tsx`
- `apps/web/src/components/seller/ProductForm.tsx`
- `apps/web/src/components/seller/ProductImageForm.tsx`
- `apps/web/src/components/seller/ProductStatusBadge.tsx`
- `apps/web/src/components/seller/SellerProductCard.tsx`
- `apps/web/src/components/seller/SellerProductTable.tsx`
- `apps/web/src/lib/sellerApi.ts`
- `apps/web/src/types/api.ts`

Funcionalidad ya comprobada:

- Seller lista productos con `GET /api/products/me`.
- Seller crea producto con `POST /api/products`.
- Seller ve detalle con `GET /api/products/me/:id`.
- Seller edita campos seguros con `PATCH /api/products/me/:id`.
- Seller gestiona imagenes con:
  - `GET /api/products/me/:id/images`
  - `POST /api/products/me/:id/images`
  - `PATCH /api/products/me/:id/images/:imageId/main`
  - `DELETE /api/products/me/:id/images/:imageId`
- Frontend no envia `seller_id` ni `tenant_id`.
- Buyer redirige a `/comprador` si intenta entrar a rutas seller.
- Admin redirige a `/admin` si intenta entrar a rutas seller.

## Verificaciones Ya Pasadas

Ultima verificacion conocida:

- `pnpm --filter @apu-luxury/web typecheck` paso.
- `pnpm --filter @apu-luxury/web build` paso.
- `GET http://localhost:4000/api/health` respondio `status: OK`.
- Rutas web principales respondieron `200`.
- Rutas seller de productos respondieron `200`.
- Flujo REST real probado: crear producto, listar, detalle, editar, crear imagen, marcar principal, borrar imagen.

No repetir todas estas pruebas salvo que se modifiquen archivos relacionados.

## UI De Carrito Del Comprador

Archivos principales:

- `apps/web/src/app/comprador/carrito/page.tsx`
- `apps/web/src/components/cart/AddToCartButton.tsx`
- `apps/web/src/components/cart/CartItemCard.tsx`
- `apps/web/src/components/cart/CartSummary.tsx`
- `apps/web/src/lib/cartApi.ts`
- `apps/web/src/app/producto/[slug]/page.tsx`
- `apps/web/src/app/comprador/page.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/types/api.ts`

Funcionalidad ya comprobada:

- Comprador agrega producto desde detalle con `POST /api/cart/items`.
- Usuario anonimo al agregar producto es redirigido a `/login`.
- Admin queda bloqueado con mensaje al intentar agregar al carrito.
- Header muestra link `Carrito` para usuario buyer.
- `/comprador/carrito` lista items activos con resumen.
- Actualizar cantidad desde UI funciona y recalcula total.
- Error backend de stock insuficiente fue validado via API.
- Eliminar item desde UI deja estado vacio.
- Vaciar carrito desde UI deja estado vacio.
- Backend rechaza admin en carrito con `403`.

Ultima verificacion conocida para carrito:

- `pnpm --filter @apu-luxury/web typecheck` paso.
- `pnpm --filter @apu-luxury/web build` paso.
- Ruta `/comprador/carrito` aparece en build.
- Rutas principales relacionadas respondieron `200`.
- Flujo UI en navegador: anonimo -> login, admin bloqueado, buyer agrega, buyer ve carrito, buyer actualiza cantidad, buyer vacia, buyer elimina item.

## UI De Checkout Y Pedidos Del Comprador

Archivos principales:

- `apps/web/src/app/comprador/checkout/page.tsx`
- `apps/web/src/app/comprador/pedidos/page.tsx`
- `apps/web/src/app/comprador/pedidos/[id]/page.tsx`
- `apps/web/src/components/orders/CheckoutForm.tsx`
- `apps/web/src/components/orders/OrderSummary.tsx`
- `apps/web/src/components/orders/BuyerOrderCard.tsx`
- `apps/web/src/components/orders/BuyerOrderItems.tsx`
- `apps/web/src/components/orders/OrderStatusBadge.tsx`
- `apps/web/src/lib/ordersApi.ts`
- `apps/web/src/components/cart/CartSummary.tsx`
- `apps/web/src/app/comprador/carrito/page.tsx`
- `apps/web/src/app/comprador/page.tsx`
- `apps/web/src/types/api.ts`

Funcionalidad ya comprobada:

- Carrito muestra `Continuar compra` hacia `/comprador/checkout`.
- Checkout carga `GET /api/cart`.
- Checkout vacio muestra empty state con link a catalogo.
- Checkout crea pedido con `POST /api/orders`, enviando solo datos de entrega.
- Backend calcula totales y convierte carrito; despues de crear pedido, `GET /api/cart` queda con items vacios.
- Creacion redirige a `/comprador/pedidos/[id]`.
- `/comprador/pedidos` lista pedidos con codigo, estado, total y resumen de seller orders.
- `/comprador/pedidos/[id]` muestra delivery, seller orders e items.
- Admin redirige a `/admin` si intenta entrar a rutas buyer de checkout/pedidos.
- Seller redirige a `/vendedor` si intenta entrar a rutas buyer de checkout/pedidos.

Ultima verificacion conocida para checkout/pedidos:

- `pnpm --filter @apu-luxury/web typecheck` paso.
- `pnpm --filter @apu-luxury/web build` paso.
- Rutas nuevas aparecen en build: `/comprador/checkout`, `/comprador/pedidos`, `/comprador/pedidos/[id]`.
- Flujo API real: agregar item, crear pedido, listar pedidos, ver detalle y comprobar carrito vacio.
- Flujo UI real en navegador: carrito -> checkout, llenar form, crear pedido, redirigir a detalle, ver lista y detalle.

## UI De Pedidos Recibidos Del Vendedor

Archivos principales:

- `apps/web/src/app/vendedor/pedidos/page.tsx`
- `apps/web/src/app/vendedor/pedidos/[id]/page.tsx`
- `apps/web/src/components/orders/SellerOrderCard.tsx`
- `apps/web/src/components/orders/SellerOrderItems.tsx`
- `apps/web/src/components/orders/SellerOrderStatusActions.tsx`
- `apps/web/src/lib/sellerOrdersApi.ts`
- `apps/web/src/app/vendedor/page.tsx`
- `apps/web/src/types/api.ts`

Funcionalidad ya comprobada:

- Seller lista pedidos recibidos con `GET /api/orders/seller`.
- Seller ve detalle con `GET /api/orders/seller/:id`.
- Seller actualiza estado con `PATCH /api/orders/seller/:id/status`.
- UI muestra filtros por status/from/to.
- UI muestra delivery, comprador e items del seller order.
- Buyer redirige a `/comprador` si intenta entrar a rutas seller de pedidos.
- Admin redirige a `/admin` si intenta entrar a rutas seller de pedidos.
- Backend rechaza admin en seller orders con `403`.

Ultima verificacion conocida para seller orders:

- `pnpm --filter @apu-luxury/web typecheck` paso.
- `pnpm --filter @apu-luxury/web build` paso.
- Rutas nuevas aparecen en build: `/vendedor/pedidos`, `/vendedor/pedidos/[id]`.
- Flujo API real: listar, detalle, actualizar status.
- Flujo UI real en navegador: seller lista, abre detalle, cambia estado, buyer/admin quedan redirigidos.

## UI De Administracion

Archivos principales:

- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/app/admin/vendedores/page.tsx`
- `apps/web/src/app/admin/productos/page.tsx`
- `apps/web/src/app/admin/productos/[id]/page.tsx`
- `apps/web/src/app/admin/pedidos/page.tsx`
- `apps/web/src/app/admin/pedidos/[id]/page.tsx`
- `apps/web/src/components/admin/AdminDashboardCard.tsx`
- `apps/web/src/components/admin/AdminSellerCard.tsx`
- `apps/web/src/components/admin/AdminProductTable.tsx`
- `apps/web/src/components/admin/AdminProductStatusActions.tsx`
- `apps/web/src/components/admin/AdminOrderCard.tsx`
- `apps/web/src/lib/adminSellersApi.ts`
- `apps/web/src/lib/adminProductsApi.ts`
- `apps/web/src/lib/adminOrdersApi.ts`
- `apps/web/src/types/api.ts`

Funcionalidad ya comprobada:

- Admin dashboard enlaza a vendedores, productos y pedidos.
- Admin lista vendedores con `GET /api/admin/sellers`.
- Admin aprueba/rechaza/suspende vendedores con endpoints PATCH.
- Admin lista productos con `GET /api/admin/products`.
- Admin ve detalle de producto con `GET /api/admin/products/:id`.
- Admin cambia estado de producto con `PATCH /api/admin/products/:id/status`.
- Admin lista pedidos con `GET /api/admin/orders`.
- Admin ve detalle de pedido con `GET /api/admin/orders/:id`.
- Buyer redirige a `/comprador` al intentar entrar a rutas admin.
- Seller redirige a `/vendedor` al intentar entrar a rutas admin.

Ultima verificacion conocida para admin:

- `pnpm --filter @apu-luxury/web typecheck` paso.
- `pnpm --filter @apu-luxury/web build` paso.
- Rutas nuevas aparecen en build: `/admin/vendedores`, `/admin/productos`, `/admin/productos/[id]`, `/admin/pedidos`, `/admin/pedidos/[id]`.
- Flujo API real: sellers list/action, products list/detail/status restore, orders list/detail.
- Flujo UI real en navegador: dashboard/listas/detalles cargan, seller action funciona, product status update/restauracion funciona, buyer/seller quedan redirigidos.

## Notas De Base De Datos

- Usar `DATABASE_URL=postgresql://postgres:aldair123@localhost:5432/apu_luxury_dev` para pruebas locales.
- No modificar migraciones SQL salvo que el usuario lo pida explicitamente o sea estrictamente necesario.
- Hay datos de prueba creados para validar flujos. No borrarlos sin autorizacion.

## Reglas Para Futuras Sesiones

- Antes de editar, revisar solo los archivos directamente relacionados con la tarea.
- Usar `rg` o `rg --files` para busquedas.
- No releer toda la base del proyecto si la tarea toca una pantalla o modulo concreto.
- No reconstruir backend y frontend completos si solo cambia un componente aislado; preferir `typecheck` del paquete afectado.
- No tocar backend para tareas de UI salvo que el contrato API lo exija.
- No tocar frontend para tareas de backend salvo que el usuario pida integracion visible.
- Mantener arquitectura modular: controller, service, repository, routes en backend; componentes, paginas, tipos y helpers API en frontend.
- No usar ORM por ahora.
- No implementar pagos, storage real, carrito UI, pedidos UI o admin UI a menos que el usuario lo pida.
