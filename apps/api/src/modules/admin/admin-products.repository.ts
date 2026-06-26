import { db } from "../../config/db";
import type { ProductStatus } from "../products/products.repository";

export type AdminProductFilters = {
  status?: ProductStatus;
  seller_id?: string;
  category_id?: string;
  search?: string;
  from?: string;
  to?: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  sellerValidationStatus: "pending" | "approved" | "rejected" | "suspended";
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  mainImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: Date;
};

export type AdminProductDetail = AdminProduct & {
  images: AdminProductImage[];
};

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: ProductStatus;
  seller_id: string;
  commercial_name: string;
  seller_slug: string;
  seller_validation_status: AdminProduct["sellerValidationStatus"];
  category_id: string;
  category_name: string;
  category_slug: string;
  main_image_url: string | null;
  created_at: Date;
  updated_at: Date;
};

type AdminProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  is_main: boolean;
  created_at: Date;
};

const adminProductColumns = `
  products.id,
  products.name,
  products.slug,
  products.description,
  products.price,
  products.stock,
  products.material,
  products.color,
  products.size,
  products.status,
  products.seller_id,
  sellers.commercial_name,
  sellers.slug AS seller_slug,
  sellers.validation_status AS seller_validation_status,
  products.category_id,
  categories.name AS category_name,
  categories.slug AS category_slug,
  main_image.image_url AS main_image_url,
  products.created_at,
  products.updated_at
`;

const adminProductJoins = `
  INNER JOIN sellers ON sellers.id = products.seller_id
    AND sellers.tenant_id = products.tenant_id
  INNER JOIN categories ON categories.id = products.category_id
  LEFT JOIN LATERAL (
    SELECT image_url
    FROM product_images
    WHERE product_images.product_id = products.id
      AND product_images.tenant_id = products.tenant_id
      AND product_images.seller_id = products.seller_id
      AND product_images.is_main = true
    ORDER BY product_images.position ASC, product_images.created_at ASC
    LIMIT 1
  ) AS main_image ON true
`;

function mapAdminProductRow(row: AdminProductRow): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    material: row.material,
    color: row.color,
    size: row.size,
    status: row.status,
    sellerId: row.seller_id,
    commercialName: row.commercial_name,
    sellerSlug: row.seller_slug,
    sellerValidationStatus: row.seller_validation_status,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    mainImageUrl: row.main_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminProductImageRow(row: AdminProductImageRow): AdminProductImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    position: row.position,
    isMain: row.is_main,
    createdAt: row.created_at,
  };
}

export async function listAdminProducts(
  filters: AdminProductFilters,
): Promise<AdminProduct[]> {
  const values: string[] = [];
  const whereClauses: string[] = [];

  if (filters.status) {
    values.push(filters.status);
    whereClauses.push(`products.status = $${values.length}`);
  }

  if (filters.seller_id) {
    values.push(filters.seller_id);
    whereClauses.push(`products.seller_id = $${values.length}`);
  }

  if (filters.category_id) {
    values.push(filters.category_id);
    whereClauses.push(`products.category_id = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(
      `(products.name ILIKE $${values.length} OR products.slug ILIKE $${values.length} OR sellers.commercial_name ILIKE $${values.length})`,
    );
  }

  if (filters.from) {
    values.push(filters.from);
    whereClauses.push(`products.created_at >= $${values.length}`);
  }

  if (filters.to) {
    values.push(filters.to);
    whereClauses.push(`products.created_at <= $${values.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await db.query<AdminProductRow>(
    `
      SELECT ${adminProductColumns}
      FROM products
      ${adminProductJoins}
      ${whereSql}
      ORDER BY products.created_at DESC
    `,
    values,
  );

  return result.rows.map(mapAdminProductRow);
}

export async function findAdminProductById(
  productId: string,
): Promise<AdminProductDetail | null> {
  const result = await db.query<AdminProductRow>(
    `
      SELECT ${adminProductColumns}
      FROM products
      ${adminProductJoins}
      WHERE products.id = $1
      LIMIT 1
    `,
    [productId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const imageResult = await db.query<AdminProductImageRow>(
    `
      SELECT id, image_url, alt_text, position, is_main, created_at
      FROM product_images
      WHERE product_id = $1
      ORDER BY position ASC, created_at ASC
    `,
    [productId],
  );

  return {
    ...mapAdminProductRow(row),
    images: imageResult.rows.map(mapAdminProductImageRow),
  };
}

export async function updateAdminProductStatus(
  productId: string,
  status: ProductStatus,
): Promise<AdminProduct | null> {
  const result = await db.query<AdminProductRow>(
    `
      UPDATE products
      SET status = $2
      WHERE id = $1
      RETURNING id
    `,
    [productId, status],
  );

  if (!result.rows[0]) {
    return null;
  }

  return findAdminProductById(productId);
}

export async function updateAdminProductModeration(input: {
  productId: string;
  status?: ProductStatus;
  categoryId?: string;
}): Promise<AdminProduct | null> {
  const result = await db.query<AdminProductRow>(
    `
      UPDATE products
      SET
        status = COALESCE($2, status),
        category_id = COALESCE($3, category_id)
      WHERE id = $1
      RETURNING id
    `,
    [input.productId, input.status, input.categoryId],
  );

  if (!result.rows[0]) {
    return null;
  }

  return findAdminProductById(input.productId);
}
