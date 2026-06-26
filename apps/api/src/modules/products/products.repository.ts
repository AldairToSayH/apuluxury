import { db } from "../../config/db";
import type {
  CreateProductInput,
  SellerProductFiltersInput,
  UpdateProductInput,
} from "./products.schemas";

export type ProductStatus = "draft" | "active" | "inactive" | "rejected";

export type Product = {
  id: string;
  tenantId: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
};

type ProductRow = {
  id: string;
  tenant_id: string;
  seller_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  created_at: Date;
  updated_at: Date;
};

const productColumns = `
  id,
  tenant_id,
  seller_id,
  category_id,
  name,
  slug,
  description,
  price,
  stock,
  material,
  color,
  size,
  status,
  created_at,
  updated_at
`;

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sellerId: row.seller_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    material: row.material,
    color: row.color,
    size: row.size,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProductForSeller(input: {
  tenantId: string;
  sellerId: string;
  product: CreateProductInput;
}): Promise<Product> {
  const result = await db.query<ProductRow>(
    `
      INSERT INTO products (
        tenant_id,
        seller_id,
        category_id,
        name,
        slug,
        description,
        price,
        stock,
        material,
        color,
        size,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING ${productColumns}
    `,
    [
      input.tenantId,
      input.sellerId,
      input.product.category_id,
      input.product.name,
      input.product.slug,
      input.product.description,
      input.product.price,
      input.product.stock,
      input.product.material,
      input.product.color,
      input.product.size,
      input.product.status,
    ],
  );

  return mapProductRow(result.rows[0]);
}

export async function listProductsByTenant(
  tenantId: string,
  filters: SellerProductFiltersInput,
): Promise<Product[]> {
  const values: Array<string | number> = [tenantId];
  const whereClauses = ["tenant_id = $1"];

  if (filters.status) {
    values.push(filters.status);
    whereClauses.push(`status = $${values.length}`);
  }

  if (filters.category_id) {
    values.push(filters.category_id);
    whereClauses.push(`category_id = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(
      `(name ILIKE $${values.length} OR slug ILIKE $${values.length} OR description ILIKE $${values.length})`,
    );
  }

  const result = await db.query<ProductRow>(
    `
      SELECT ${productColumns}
      FROM products
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY created_at DESC
    `,
    values,
  );

  return result.rows.map(mapProductRow);
}

export async function findProductByTenantAndId(
  tenantId: string,
  productId: string,
): Promise<Product | null> {
  const result = await db.query<ProductRow>(
    `
      SELECT ${productColumns}
      FROM products
      WHERE tenant_id = $1
        AND id = $2
      LIMIT 1
    `,
    [tenantId, productId],
  );

  const row = result.rows[0];

  return row ? mapProductRow(row) : null;
}

export async function updateProductByTenantAndId(
  tenantId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<Product | null> {
  const result = await db.query<ProductRow>(
    `
      UPDATE products
      SET
        category_id = COALESCE($3, category_id),
        name = COALESCE($4, name),
        slug = COALESCE($5, slug),
        description = COALESCE($6, description),
        price = COALESCE($7, price),
        stock = COALESCE($8, stock),
        material = COALESCE($9, material),
        color = COALESCE($10, color),
        size = COALESCE($11, size),
        status = COALESCE($12, status)
      WHERE tenant_id = $1
        AND id = $2
      RETURNING ${productColumns}
    `,
    [
      tenantId,
      productId,
      input.category_id,
      input.name,
      input.slug,
      input.description,
      input.price,
      input.stock,
      input.material,
      input.color,
      input.size,
      input.status,
    ],
  );

  const row = result.rows[0];

  return row ? mapProductRow(row) : null;
}

export async function updateProductStatusByTenantAndId(
  tenantId: string,
  productId: string,
  status: "draft" | "active" | "inactive",
): Promise<Product | null> {
  const result = await db.query<ProductRow>(
    `
      UPDATE products
      SET status = $3
      WHERE tenant_id = $1
        AND id = $2
      RETURNING ${productColumns}
    `,
    [tenantId, productId, status],
  );

  const row = result.rows[0];

  return row ? mapProductRow(row) : null;
}
