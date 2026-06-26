# API Overview

Base local: `http://localhost:4000`

## Health

- `GET /health`
- `GET /api/health`

## Auth

- `POST /api/auth/register-buyer`
- `POST /api/auth/register-seller`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Sellers

- `GET /api/sellers/me`
- `PATCH /api/sellers/me`

## Admin

Todas las rutas admin requieren JWT con rol `admin`.

- `GET /api/admin/sellers`
- `PATCH /api/admin/sellers/:id/approve`
- `PATCH /api/admin/sellers/:id/reject`
- `PATCH /api/admin/sellers/:id/suspend`
- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `PATCH /api/admin/products/:id/status`
- `PATCH /api/admin/products/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`

## Products

Rutas de vendedor:

- `POST /api/products`
- `GET /api/products/me`
- `GET /api/products/me/:id`
- `PATCH /api/products/me/:id`
- `PATCH /api/products/me/:id/status`

Imagenes de producto:

- `GET /api/products/me/:productId/images`
- `POST /api/products/me/:productId/images`
- `PATCH /api/products/me/:productId/images/:imageId`
- `PATCH /api/products/me/:productId/images/:imageId/main`
- `DELETE /api/products/me/:productId/images/:imageId`

## Catalog And Categories

- `GET /api/catalog/products`
- `GET /api/catalog/products/:slug`
- `GET /api/categories`

## Cart

Todas las rutas de carrito requieren JWT con rol `buyer`.

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

## Orders

Buyer:

- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/my/:id`

Seller:

- `GET /api/orders/seller`
- `GET /api/orders/seller/:id`
- `PATCH /api/orders/seller/:id/status`

Los pedidos no incluyen pagos en el estado actual del MVP.
