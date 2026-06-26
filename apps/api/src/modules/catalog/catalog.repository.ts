import { db } from "../../config/db";
import type { CatalogFiltersInput } from "./catalog.schemas";

export type CatalogProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  sellerId: string;
  commercialName: string;
  sellerSlug: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: "active";
  mainImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CatalogProductImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: Date;
};

export type CatalogProductDetail = CatalogProduct & {
  images: CatalogProductImage[];
};

type CatalogProductRow = {
  id: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  seller_id: string;
  commercial_name: string;
  seller_slug: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  status: "active";
  main_image_url: string | null;
  created_at: Date;
  updated_at: Date;
};

type CatalogProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  position: number;
  is_main: boolean;
  created_at: Date;
};

const catalogProductColumns = `
  products.id,
  products.category_id,
  categories.name AS category_name,
  categories.slug AS category_slug,
  products.seller_id,
  sellers.commercial_name,
  sellers.slug AS seller_slug,
  products.name,
  products.slug,
  products.description,
  products.price,
  products.stock,
  products.material,
  products.color,
  products.size,
  products.status,
  main_image.image_url AS main_image_url,
  products.created_at,
  products.updated_at
`;

function mapCatalogProductRow(row: CatalogProductRow): CatalogProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    sellerId: row.seller_id,
    commercialName: row.commercial_name,
    sellerSlug: row.seller_slug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    material: row.material,
    color: row.color,
    size: row.size,
    status: row.status,
    mainImageUrl: row.main_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCatalogProductImageRow(
  row: CatalogProductImageRow,
): CatalogProductImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    altText: row.alt_text,
    position: row.position,
    isMain: row.is_main,
    createdAt: row.created_at,
  };
}

function baseCatalogWhere() {
  return [
    "products.status = 'active'",
    "sellers.validation_status = 'approved'",
    "categories.status = 'active'",
  ];
}

export async function listCatalogProducts(
  filters: CatalogFiltersInput,
): Promise<CatalogProduct[]> {
  const values: Array<string | number> = [];
  const whereClauses = baseCatalogWhere();

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(
      `(products.name ILIKE $${values.length} OR products.description ILIKE $${values.length} OR sellers.commercial_name ILIKE $${values.length})`,
    );
  }

  if (filters.category) {
    values.push(filters.category);
    whereClauses.push(`categories.slug = $${values.length}`);
  }

  if (filters.category_id) {
    values.push(filters.category_id);
    whereClauses.push(`products.category_id = $${values.length}`);
  }

  if (filters.sellerSlug) {
    values.push(filters.sellerSlug);
    whereClauses.push(`sellers.slug = $${values.length}`);
  }

  if (filters.minPrice !== undefined) {
    values.push(filters.minPrice);
    whereClauses.push(`products.price >= $${values.length}`);
  }

  if (filters.maxPrice !== undefined) {
    values.push(filters.maxPrice);
    whereClauses.push(`products.price <= $${values.length}`);
  }

  const result = await db.query<CatalogProductRow>(
    `
      SELECT ${catalogProductColumns}
      FROM products
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
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY products.created_at DESC
    `,
    values,
  );

  return result.rows.map(mapCatalogProductRow);
}

export async function findCatalogProductBySlug(
  slug: string,
): Promise<CatalogProductDetail | null> {
  const result = await db.query<CatalogProductRow>(
    `
      SELECT ${catalogProductColumns}
      FROM products
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
      WHERE ${baseCatalogWhere().join(" AND ")}
        AND products.slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const product = mapCatalogProductRow(row);
  const imagesResult = await db.query<CatalogProductImageRow>(
    `
      SELECT id, image_url, alt_text, position, is_main, created_at
      FROM product_images
      WHERE product_id = $1
      ORDER BY position ASC, created_at ASC
    `,
    [product.id],
  );

  return {
    ...product,
    images: imagesResult.rows.map(mapCatalogProductImageRow),
  };
}
