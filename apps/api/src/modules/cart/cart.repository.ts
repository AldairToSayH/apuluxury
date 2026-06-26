import { db } from "../../config/db";

export type Cart = {
  id: string;
  buyerId: string;
  status: "active" | "converted" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  unitPriceAtAdded: number;
  quantity: number;
  subtotal: number;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  categoryId: string;
  categoryName: string;
  productStatus: "draft" | "active" | "inactive" | "rejected";
};

export type CartDetails = Cart & {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
};

export type ProductForCart = {
  id: string;
  tenantId: string;
  sellerId: string;
  price: number;
  stock: number;
  status: "draft" | "active" | "inactive" | "rejected";
  sellerValidationStatus: "pending" | "approved" | "rejected" | "suspended";
};

export type CartItemOwnership = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  productStock: number;
};

type CartRow = {
  id: string;
  buyer_id: string;
  status: Cart["status"];
  created_at: Date;
  updated_at: Date;
};

type CartItemRow = {
  cart_item_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  unit_price: string;
  unit_price_at_added: string;
  quantity: number;
  subtotal: string;
  seller_id: string;
  commercial_name: string;
  seller_slug: string;
  category_id: string;
  category_name: string;
  product_status: CartItem["productStatus"];
};

type ProductForCartRow = {
  id: string;
  tenant_id: string;
  seller_id: string;
  price: string;
  stock: number;
  status: ProductForCart["status"];
  seller_validation_status: ProductForCart["sellerValidationStatus"];
};

type CartItemOwnershipRow = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product_stock: number;
};

function mapCartRow(row: CartRow): Cart {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCartItemRow(row: CartItemRow): CartItem {
  return {
    cartItemId: row.cart_item_id,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    unitPrice: Number(row.unit_price),
    unitPriceAtAdded: Number(row.unit_price_at_added),
    quantity: row.quantity,
    subtotal: Number(row.subtotal),
    sellerId: row.seller_id,
    commercialName: row.commercial_name,
    sellerSlug: row.seller_slug,
    categoryId: row.category_id,
    categoryName: row.category_name,
    productStatus: row.product_status,
  };
}

function mapProductForCartRow(row: ProductForCartRow): ProductForCart {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sellerId: row.seller_id,
    price: Number(row.price),
    stock: row.stock,
    status: row.status,
    sellerValidationStatus: row.seller_validation_status,
  };
}

export async function getOrCreateActiveCart(buyerId: string): Promise<Cart> {
  const result = await db.query<CartRow>(
    `
      INSERT INTO carts (buyer_id, status)
      VALUES ($1, 'active')
      ON CONFLICT (buyer_id) WHERE status = 'active'
      DO UPDATE SET buyer_id = EXCLUDED.buyer_id
      RETURNING id, buyer_id, status, created_at, updated_at
    `,
    [buyerId],
  );

  return mapCartRow(result.rows[0]);
}

export async function getCartDetails(cart: Cart): Promise<CartDetails> {
  const result = await db.query<CartItemRow>(
    `
      SELECT
        cart_items.id AS cart_item_id,
        products.id AS product_id,
        products.name AS product_name,
        products.slug AS product_slug,
        products.price AS unit_price,
        cart_items.unit_price_at_added,
        cart_items.quantity,
        (cart_items.unit_price_at_added * cart_items.quantity) AS subtotal,
        sellers.id AS seller_id,
        sellers.commercial_name,
        sellers.slug AS seller_slug,
        categories.id AS category_id,
        categories.name AS category_name,
        products.status AS product_status
      FROM cart_items
      INNER JOIN products ON products.id = cart_items.product_id
        AND products.tenant_id = cart_items.tenant_id
        AND products.seller_id = cart_items.seller_id
      INNER JOIN sellers ON sellers.id = cart_items.seller_id
        AND sellers.tenant_id = cart_items.tenant_id
      INNER JOIN categories ON categories.id = products.category_id
      WHERE cart_items.cart_id = $1
      ORDER BY cart_items.created_at ASC
    `,
    [cart.id],
  );

  const items = result.rows.map(mapCartItemRow);

  return {
    ...cart,
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: items.reduce((total, item) => total + item.subtotal, 0),
  };
}

export async function findProductForCart(
  productId: string,
): Promise<ProductForCart | null> {
  const result = await db.query<ProductForCartRow>(
    `
      SELECT
        products.id,
        products.tenant_id,
        products.seller_id,
        products.price,
        products.stock,
        products.status,
        sellers.validation_status AS seller_validation_status
      FROM products
      INNER JOIN sellers ON sellers.id = products.seller_id
        AND sellers.tenant_id = products.tenant_id
      WHERE products.id = $1
      LIMIT 1
    `,
    [productId],
  );

  const row = result.rows[0];

  return row ? mapProductForCartRow(row) : null;
}

export async function findCartItemByCartAndProduct(
  cartId: string,
  productId: string,
): Promise<{ id: string; quantity: number } | null> {
  const result = await db.query<{ id: string; quantity: number }>(
    `
      SELECT id, quantity
      FROM cart_items
      WHERE cart_id = $1
        AND product_id = $2
      LIMIT 1
    `,
    [cartId, productId],
  );

  return result.rows[0] ?? null;
}

export async function insertCartItem(input: {
  cartId: string;
  product: ProductForCart;
  quantity: number;
}): Promise<void> {
  await db.query(
    `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        tenant_id,
        seller_id,
        quantity,
        unit_price_at_added
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.cartId,
      input.product.id,
      input.product.tenantId,
      input.product.sellerId,
      input.quantity,
      input.product.price,
    ],
  );
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<void> {
  await db.query(
    `
      UPDATE cart_items
      SET quantity = $2
      WHERE id = $1
    `,
    [cartItemId, quantity],
  );
}

export async function findCartItemForBuyer(
  cartItemId: string,
  buyerId: string,
): Promise<CartItemOwnership | null> {
  const result = await db.query<CartItemOwnershipRow>(
    `
      SELECT
        cart_items.id,
        cart_items.cart_id,
        cart_items.product_id,
        cart_items.quantity,
        products.stock AS product_stock
      FROM cart_items
      INNER JOIN carts ON carts.id = cart_items.cart_id
      INNER JOIN products ON products.id = cart_items.product_id
        AND products.tenant_id = cart_items.tenant_id
        AND products.seller_id = cart_items.seller_id
      WHERE cart_items.id = $1
        AND carts.buyer_id = $2
        AND carts.status = 'active'
      LIMIT 1
    `,
    [cartItemId, buyerId],
  );

  const row = result.rows[0];

  return row
    ? {
        id: row.id,
        cartId: row.cart_id,
        productId: row.product_id,
        quantity: row.quantity,
        productStock: row.product_stock,
      }
    : null;
}

export async function deleteCartItemForBuyer(
  cartItemId: string,
  buyerId: string,
): Promise<boolean> {
  const result = await db.query(
    `
      DELETE FROM cart_items
      USING carts
      WHERE cart_items.cart_id = carts.id
        AND cart_items.id = $1
        AND carts.buyer_id = $2
        AND carts.status = 'active'
    `,
    [cartItemId, buyerId],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function clearActiveCartItems(buyerId: string): Promise<void> {
  await db.query(
    `
      DELETE FROM cart_items
      USING carts
      WHERE cart_items.cart_id = carts.id
        AND carts.buyer_id = $1
        AND carts.status = 'active'
    `,
    [buyerId],
  );
}
