import type { PoolClient } from "pg";

import { db } from "../../config/db";
import { HttpError } from "../../utils/http-error";
import type { CreateOrderInput } from "./orders.schemas";
import type {
  AdminOrderFiltersInput,
  BuyerOrderFiltersInput,
  SellerOrderFiltersInput,
} from "./orders.schemas";

export type OrderStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type SellerOrderStatus =
  | "pending"
  | "in_preparation"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderSummary = {
  id: string;
  buyerId: string;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  deliveryFullName: string | null;
  deliveryPhone: string | null;
  deliveryAddress: string | null;
  deliveryReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyerEmail?: string;
  sellerOrders?: SellerOrderSummary[];
};

export type SellerOrderSummary = {
  id: string;
  orderId: string;
  tenantId: string;
  sellerId: string;
  sellerCommercialName?: string;
  sellerSlug?: string;
  orderCode?: string;
  orderStatus?: OrderStatus;
  status: SellerOrderStatus;
  subtotalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  sellerOrderId: string;
  productId: string;
  tenantId: string;
  sellerId: string;
  productName: string;
  productSlug: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
};

export type OrderDetail = OrderSummary & {
  sellerOrders: Array<SellerOrderSummary & { items: OrderItem[] }>;
};

export type SellerOrderDetail = SellerOrderSummary & {
  buyerId: string;
  buyerEmail: string;
  deliveryFullName: string | null;
  deliveryPhone: string | null;
  deliveryAddress: string | null;
  deliveryReference: string | null;
  items: OrderItem[];
};

export type PublicTrackedOrder = {
  orderCode: string;
  status: OrderStatus;
  createdAt: Date;
  totalAmount: number;
  currency: string;
  sellerOrders: Array<{
    sellerCommercialName: string;
    status: SellerOrderStatus;
    subtotalAmount: number;
    items: Array<{
      productName: string;
      quantity: number;
      subtotal: number;
    }>;
  }>;
};

type OrderRow = {
  id: string;
  buyer_id: string;
  order_code: string;
  status: OrderStatus;
  total_amount: string;
  currency: string;
  delivery_full_name: string | null;
  delivery_phone: string | null;
  delivery_address: string | null;
  delivery_reference: string | null;
  created_at: Date;
  updated_at: Date;
  buyer_email?: string;
};

type SellerOrderRow = {
  id: string;
  order_id: string;
  tenant_id: string;
  seller_id: string;
  seller_commercial_name?: string;
  seller_slug?: string;
  order_code?: string;
  order_status?: OrderStatus;
  status: SellerOrderStatus;
  subtotal_amount: string;
  created_at: Date;
  updated_at: Date;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  seller_order_id: string;
  product_id: string;
  tenant_id: string;
  seller_id: string;
  product_name: string;
  product_slug: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
  created_at: Date;
};

type CartOrderItemRow = {
  cart_item_id: string;
  product_id: string;
  tenant_id: string;
  seller_id: string;
  product_name: string;
  product_slug: string;
  product_status: "draft" | "active" | "inactive" | "rejected";
  product_price: string;
  stock: number;
  seller_validation_status: "pending" | "approved" | "rejected" | "suspended";
  quantity: number;
};

const orderColumns = `
  id,
  buyer_id,
  order_code,
  status,
  total_amount,
  currency,
  delivery_full_name,
  delivery_phone,
  delivery_address,
  delivery_reference,
  created_at,
  updated_at
`;

const sellerOrderColumns = `
  id,
  order_id,
  tenant_id,
  seller_id,
  status,
  subtotal_amount,
  created_at,
  updated_at
`;

const orderItemColumns = `
  id,
  order_id,
  seller_order_id,
  product_id,
  tenant_id,
  seller_id,
  product_name,
  product_slug,
  unit_price,
  quantity,
  subtotal,
  created_at
`;

function mapOrderRow(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    orderCode: row.order_code,
    status: row.status,
    totalAmount: Number(row.total_amount),
    currency: row.currency,
    deliveryFullName: row.delivery_full_name,
    deliveryPhone: row.delivery_phone,
    deliveryAddress: row.delivery_address,
    deliveryReference: row.delivery_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.buyer_email && { buyerEmail: row.buyer_email }),
  };
}

function mapSellerOrderRow(row: SellerOrderRow): SellerOrderSummary {
  return {
    id: row.id,
    orderId: row.order_id,
    tenantId: row.tenant_id,
    sellerId: row.seller_id,
    ...(row.seller_commercial_name && {
      sellerCommercialName: row.seller_commercial_name,
    }),
    ...(row.seller_slug && { sellerSlug: row.seller_slug }),
    ...(row.order_code && { orderCode: row.order_code }),
    ...(row.order_status && { orderStatus: row.order_status }),
    status: row.status,
    subtotalAmount: Number(row.subtotal_amount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    sellerOrderId: row.seller_order_id,
    productId: row.product_id,
    tenantId: row.tenant_id,
    sellerId: row.seller_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    subtotal: Number(row.subtotal),
    createdAt: row.created_at,
  };
}

function createOrderCode(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `APU-${yyyy}${mm}${dd}-${suffix}`;
}

export async function createOrderFromActiveCart(input: {
  buyerId: string;
  userId: string;
  delivery: CreateOrderInput;
}): Promise<OrderDetail> {
  const client = await db.connect();
  let didCommit = false;

  try {
    await client.query("BEGIN");

    const cartResult = await client.query<{ id: string }>(
      `
        SELECT id
        FROM carts
        WHERE buyer_id = $1
          AND status = 'active'
        LIMIT 1
        FOR UPDATE
      `,
      [input.buyerId],
    );

    const cartId = cartResult.rows[0]?.id;

    if (!cartId) {
      throw new HttpError(400, "Active cart was not found");
    }

    const itemsResult = await client.query<CartOrderItemRow>(
      `
        SELECT
          cart_items.id AS cart_item_id,
          products.id AS product_id,
          products.tenant_id,
          products.seller_id,
          products.name AS product_name,
          products.slug AS product_slug,
          products.status AS product_status,
          products.price AS product_price,
          products.stock,
          sellers.validation_status AS seller_validation_status,
          cart_items.quantity
        FROM cart_items
        INNER JOIN products ON products.id = cart_items.product_id
          AND products.tenant_id = cart_items.tenant_id
          AND products.seller_id = cart_items.seller_id
        INNER JOIN sellers ON sellers.id = products.seller_id
          AND sellers.tenant_id = products.tenant_id
        WHERE cart_items.cart_id = $1
        ORDER BY cart_items.created_at ASC
        FOR UPDATE OF products
      `,
      [cartId],
    );

    const items = itemsResult.rows;

    if (items.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    for (const item of items) {
      if (item.product_status !== "active") {
        throw new HttpError(400, "Cart contains inactive products");
      }

      if (item.seller_validation_status !== "approved") {
        throw new HttpError(400, "Cart contains products from unapproved sellers");
      }

      if (item.quantity > item.stock) {
        throw new HttpError(400, "Cart contains products without enough stock");
      }
    }

    const totalAmount = items.reduce(
      (total, item) => total + Number(item.product_price) * item.quantity,
      0,
    );

    const orderResult = await client.query<OrderRow>(
      `
        INSERT INTO orders (
          buyer_id,
          order_code,
          status,
          total_amount,
          delivery_full_name,
          delivery_phone,
          delivery_address,
          delivery_reference
        )
        VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7)
        RETURNING ${orderColumns}
      `,
      [
        input.buyerId,
        createOrderCode(),
        totalAmount,
        input.delivery.delivery_full_name,
        input.delivery.delivery_phone,
        input.delivery.delivery_address,
        input.delivery.delivery_reference,
      ],
    );
    const order = mapOrderRow(orderResult.rows[0]);

    const itemsBySeller = new Map<string, CartOrderItemRow[]>();

    for (const item of items) {
      const key = `${item.seller_id}:${item.tenant_id}`;
      itemsBySeller.set(key, [...(itemsBySeller.get(key) ?? []), item]);
    }

    for (const sellerItems of itemsBySeller.values()) {
      const firstItem = sellerItems[0];
      const subtotalAmount = sellerItems.reduce(
        (total, item) => total + Number(item.product_price) * item.quantity,
        0,
      );

      const sellerOrderResult = await client.query<SellerOrderRow>(
        `
          INSERT INTO seller_orders (
            order_id,
            tenant_id,
            seller_id,
            status,
            subtotal_amount
          )
          VALUES ($1, $2, $3, 'pending', $4)
          RETURNING ${sellerOrderColumns}
        `,
        [order.id, firstItem.tenant_id, firstItem.seller_id, subtotalAmount],
      );
      const sellerOrder = mapSellerOrderRow(sellerOrderResult.rows[0]);

      for (const item of sellerItems) {
        const unitPrice = Number(item.product_price);
        const subtotal = unitPrice * item.quantity;

        const stockUpdate = await client.query<{ stock: number }>(
          `
            UPDATE products
            SET stock = stock - $2
            WHERE id = $1
              AND tenant_id = $3
              AND seller_id = $4
              AND stock >= $2
            RETURNING stock
          `,
          [item.product_id, item.quantity, item.tenant_id, item.seller_id],
        );

        const updatedStock = stockUpdate.rows[0]?.stock;

        if (updatedStock === undefined) {
          throw new HttpError(409, "Product stock changed. Please review cart");
        }

        await client.query(
          `
            INSERT INTO order_items (
              order_id,
              seller_order_id,
              product_id,
              tenant_id,
              seller_id,
              product_name,
              product_slug,
              unit_price,
              quantity,
              subtotal
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `,
          [
            order.id,
            sellerOrder.id,
            item.product_id,
            item.tenant_id,
            item.seller_id,
            item.product_name,
            item.product_slug,
            unitPrice,
            item.quantity,
            subtotal,
          ],
        );

        await client.query(
          `
            INSERT INTO inventory_movements (
              product_id,
              tenant_id,
              seller_id,
              movement_type,
              quantity_delta,
              previous_stock,
              new_stock,
              reason,
              reference_type,
              reference_id,
              created_by
            )
            VALUES ($1, $2, $3, 'sale', $4, $5, $6, $7, 'order', $8, $9)
          `,
          [
            item.product_id,
            item.tenant_id,
            item.seller_id,
            -item.quantity,
            item.stock,
            updatedStock,
            `Sale for order ${order.orderCode}`,
            order.id,
            input.userId,
          ],
        );
      }
    }

    await client.query(
      `
        UPDATE carts
        SET status = 'converted'
        WHERE id = $1
      `,
      [cartId],
    );

    await client.query("COMMIT");
    didCommit = true;

    return hydrateOrderDetail(order);
  } catch (error) {
    if (!didCommit) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
}

function applyDateAndStatusFilters(
  values: Array<string>,
  whereClauses: string[],
  filters: { status?: string; from?: string; to?: string },
  tableAlias: string,
) {
  if (filters.status) {
    values.push(filters.status);
    whereClauses.push(`${tableAlias}.status = $${values.length}`);
  }

  if (filters.from) {
    values.push(filters.from);
    whereClauses.push(`${tableAlias}.created_at >= $${values.length}`);
  }

  if (filters.to) {
    values.push(filters.to);
    whereClauses.push(`${tableAlias}.created_at <= $${values.length}`);
  }
}

export async function listOrdersForBuyer(
  buyerId: string,
  filters: BuyerOrderFiltersInput,
): Promise<OrderSummary[]> {
  const values = [buyerId];
  const whereClauses = ["orders.buyer_id = $1"];

  applyDateAndStatusFilters(values, whereClauses, filters, "orders");

  const result = await db.query<OrderRow>(
    `
      SELECT
        orders.id,
        orders.buyer_id,
        orders.order_code,
        orders.status,
        orders.total_amount,
        orders.currency,
        orders.delivery_full_name,
        orders.delivery_phone,
        orders.delivery_address,
        orders.delivery_reference,
        orders.created_at,
        orders.updated_at
      FROM orders
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY orders.created_at DESC
    `,
    values,
  );

  const orders = result.rows.map(mapOrderRow);

  for (const order of orders) {
    order.sellerOrders = await listSellerOrdersForOrder(order.id);
  }

  return orders;
}

export async function findOrderDetailById(
  orderId: string,
  buyerId?: string,
): Promise<OrderDetail | null> {
  const values = [orderId];
  const buyerSql = buyerId ? "AND buyer_id = $2" : "";

  if (buyerId) {
    values.push(buyerId);
  }

  const orderResult = await db.query<OrderRow>(
    `
      SELECT ${orderColumns}
      FROM orders
      WHERE id = $1
        ${buyerSql}
      LIMIT 1
    `,
    values,
  );

  const row = orderResult.rows[0];

  if (!row) {
    return null;
  }

  return hydrateOrderDetail(mapOrderRow(row));
}

export async function findPublicTrackedOrder(
  orderCode: string,
  deliveryPhone: string,
): Promise<PublicTrackedOrder | null> {
  const orderResult = await db.query<OrderRow>(
    `
      SELECT ${orderColumns}
      FROM orders
      WHERE UPPER(order_code) = UPPER($1)
        AND delivery_phone = $2
      LIMIT 1
    `,
    [orderCode, deliveryPhone],
  );

  const row = orderResult.rows[0];

  if (!row) {
    return null;
  }

  const order = await hydrateOrderDetail(mapOrderRow(row));
  const sellerOrders = order.sellerOrders as Array<
    SellerOrderSummary & { items: OrderItem[] }
  >;

  return {
    orderCode: order.orderCode,
    status: order.status,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    currency: order.currency,
    sellerOrders: sellerOrders.map((sellerOrder) => ({
      sellerCommercialName: sellerOrder.sellerCommercialName ?? "Vendedor APU LUXURY",
      status: sellerOrder.status,
      subtotalAmount: sellerOrder.subtotalAmount,
      items: sellerOrder.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    })),
  };
}

async function listSellerOrdersForOrder(orderId: string) {
  const result = await db.query<SellerOrderRow>(
    `
      SELECT
        seller_orders.id,
        seller_orders.order_id,
        seller_orders.tenant_id,
        seller_orders.seller_id,
        sellers.commercial_name AS seller_commercial_name,
        sellers.slug AS seller_slug,
        seller_orders.status,
        seller_orders.subtotal_amount,
        seller_orders.created_at,
        seller_orders.updated_at
      FROM seller_orders
      INNER JOIN sellers ON sellers.id = seller_orders.seller_id
        AND sellers.tenant_id = seller_orders.tenant_id
      WHERE seller_orders.order_id = $1
      ORDER BY seller_orders.created_at ASC
    `,
    [orderId],
  );

  return result.rows.map(mapSellerOrderRow);
}

async function listOrderItemsForSellerOrder(sellerOrderId: string) {
  const result = await db.query<OrderItemRow>(
    `
      SELECT ${orderItemColumns}
      FROM order_items
      WHERE seller_order_id = $1
      ORDER BY created_at ASC
    `,
    [sellerOrderId],
  );

  return result.rows.map(mapOrderItemRow);
}

async function hydrateOrderDetail(order: OrderSummary): Promise<OrderDetail> {
  const sellerOrders = await listSellerOrdersForOrder(order.id);

  return {
    ...order,
    sellerOrders: await Promise.all(
      sellerOrders.map(async (sellerOrder) => ({
        ...sellerOrder,
        items: await listOrderItemsForSellerOrder(sellerOrder.id),
      })),
    ),
  };
}

export async function listSellerOrdersForTenant(
  tenantId: string,
  filters: SellerOrderFiltersInput,
): Promise<SellerOrderSummary[]> {
  const values = [tenantId];
  const whereClauses = ["seller_orders.tenant_id = $1"];

  applyDateAndStatusFilters(values, whereClauses, filters, "seller_orders");

  const result = await db.query<SellerOrderRow>(
    `
      SELECT
        seller_orders.id,
        seller_orders.order_id,
        seller_orders.tenant_id,
        seller_orders.seller_id,
        orders.order_code,
        orders.status AS order_status,
        seller_orders.status,
        seller_orders.subtotal_amount,
        seller_orders.created_at,
        seller_orders.updated_at
      FROM seller_orders
      INNER JOIN orders ON orders.id = seller_orders.order_id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY seller_orders.created_at DESC
    `,
    values,
  );

  return result.rows.map(mapSellerOrderRow);
}

export async function findSellerOrderDetailByTenant(
  sellerOrderId: string,
  tenantId: string,
): Promise<SellerOrderDetail | null> {
  const result = await db.query<
    SellerOrderRow & {
      buyer_id: string;
      buyer_email: string;
      delivery_full_name: string | null;
      delivery_phone: string | null;
      delivery_address: string | null;
      delivery_reference: string | null;
    }
  >(
    `
      SELECT
        seller_orders.id,
        seller_orders.order_id,
        seller_orders.tenant_id,
        seller_orders.seller_id,
        orders.order_code,
        orders.status AS order_status,
        seller_orders.status,
        seller_orders.subtotal_amount,
        seller_orders.created_at,
        seller_orders.updated_at,
        orders.buyer_id,
        users.email AS buyer_email,
        orders.delivery_full_name,
        orders.delivery_phone,
        orders.delivery_address,
        orders.delivery_reference
      FROM seller_orders
      INNER JOIN orders ON orders.id = seller_orders.order_id
      INNER JOIN buyers ON buyers.id = orders.buyer_id
      INNER JOIN users ON users.id = buyers.user_id
      WHERE seller_orders.id = $1
        AND seller_orders.tenant_id = $2
      LIMIT 1
    `,
    [sellerOrderId, tenantId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...mapSellerOrderRow(row),
    buyerId: row.buyer_id,
    buyerEmail: row.buyer_email,
    deliveryFullName: row.delivery_full_name,
    deliveryPhone: row.delivery_phone,
    deliveryAddress: row.delivery_address,
    deliveryReference: row.delivery_reference,
    items: await listOrderItemsForSellerOrder(row.id),
  };
}

export async function updateSellerOrderStatusForTenant(input: {
  sellerOrderId: string;
  tenantId: string;
  status: Exclude<SellerOrderStatus, "pending">;
  changedBy: string;
  note?: string;
}): Promise<SellerOrderDetail | null> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const currentResult = await client.query<{
      id: string;
      status: SellerOrderStatus;
    }>(
      `
        SELECT id, status
        FROM seller_orders
        WHERE id = $1
          AND tenant_id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [input.sellerOrderId, input.tenantId],
    );

    const current = currentResult.rows[0];

    if (!current) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE seller_orders
        SET status = $3
        WHERE id = $1
          AND tenant_id = $2
      `,
      [input.sellerOrderId, input.tenantId, input.status],
    );

    await client.query(
      `
        INSERT INTO order_status_history (
          seller_order_id,
          previous_status,
          new_status,
          changed_by,
          note
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        input.sellerOrderId,
        current.status,
        input.status,
        input.changedBy,
        input.note,
      ],
    );

    await client.query("COMMIT");

    return findSellerOrderDetailByTenant(input.sellerOrderId, input.tenantId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listAdminOrders(
  filters: AdminOrderFiltersInput,
): Promise<OrderSummary[]> {
  const values: string[] = [];
  const whereClauses: string[] = [];

  applyDateAndStatusFilters(values, whereClauses, filters, "orders");

  if (filters.search || filters.order_code) {
    values.push(`%${filters.search ?? filters.order_code}%`);
    whereClauses.push(`orders.order_code ILIKE $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await db.query<OrderRow>(
    `
      SELECT
        orders.id,
        orders.buyer_id,
        orders.order_code,
        orders.status,
        orders.total_amount,
        orders.currency,
        orders.delivery_full_name,
        orders.delivery_phone,
        orders.delivery_address,
        orders.delivery_reference,
        orders.created_at,
        orders.updated_at,
        users.email AS buyer_email
      FROM orders
      INNER JOIN buyers ON buyers.id = orders.buyer_id
      INNER JOIN users ON users.id = buyers.user_id
      ${whereSql}
      ORDER BY orders.created_at DESC
    `,
    values,
  );

  const orders = result.rows.map(mapOrderRow);

  for (const order of orders) {
    order.sellerOrders = await listSellerOrdersForOrder(order.id);
  }

  return orders;
}
