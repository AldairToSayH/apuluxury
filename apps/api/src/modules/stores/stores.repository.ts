import { db } from "../../config/db";
import type { StoresFiltersInput } from "./stores.schemas";

export type PublicStoreSampleProduct = {
  name: string;
  slug: string;
  mainImageUrl: string | null;
  price: number;
};

export type PublicStore = {
  id: string;
  commercialName: string;
  slug: string;
  subdomain: string;
  businessDescription: string | null;
  phone: string | null;
  createdAt: Date;
  productCount: number;
  sampleProducts: PublicStoreSampleProduct[];
};

export type PublicStoreProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  mainImageUrl: string | null;
  createdAt: Date;
};

export type PublicStoreDetail = PublicStore & {
  products: PublicStoreProduct[];
};

type StoreRow = {
  id: string;
  commercial_name: string;
  slug: string;
  subdomain: string;
  business_description: string | null;
  phone: string | null;
  created_at: Date;
  product_count: string;
  sample_products: PublicStoreSampleProduct[] | null;
};

type StoreProductRow = {
  id: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  material: string | null;
  color: string | null;
  size: string | null;
  main_image_url: string | null;
  created_at: Date;
};

function mapStoreRow(row: StoreRow): PublicStore {
  return {
    id: row.id,
    commercialName: row.commercial_name,
    slug: row.slug,
    subdomain: row.subdomain,
    businessDescription: row.business_description,
    phone: row.phone,
    createdAt: row.created_at,
    productCount: Number(row.product_count),
    sampleProducts: row.sample_products ?? [],
  };
}

function mapStoreProductRow(row: StoreProductRow): PublicStoreProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    material: row.material,
    color: row.color,
    size: row.size,
    mainImageUrl: row.main_image_url,
    createdAt: row.created_at,
  };
}

function buildStoreFilters(filters: StoresFiltersInput) {
  const values: string[] = [];
  const whereClauses = [
    "stores.status = 'active'",
    "sellers.validation_status = 'approved'",
  ];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(
      `(stores.name ILIKE $${values.length} OR stores.description ILIKE $${values.length} OR stores.subdomain ILIKE $${values.length})`,
    );
  }

  if (filters.category_id) {
    values.push(filters.category_id);
    whereClauses.push(`
      EXISTS (
        SELECT 1
        FROM products
        WHERE products.seller_id = stores.seller_id
          AND products.tenant_id = sellers.tenant_id
          AND products.status = 'active'
          AND products.category_id = $${values.length}
      )
    `);
  }

  return { values, whereClauses };
}

const storeSelectColumns = `
  stores.id,
  stores.name AS commercial_name,
  stores.slug,
  stores.subdomain,
  stores.description AS business_description,
  sellers.phone,
  stores.created_at,
  COALESCE(product_counts.product_count, 0)::text AS product_count,
  COALESCE(sample_products.sample_products, '[]'::json) AS sample_products
`;

const storePublicJoins = `
  INNER JOIN sellers ON sellers.id = stores.seller_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS product_count
    FROM products
    WHERE products.seller_id = stores.seller_id
      AND products.tenant_id = sellers.tenant_id
      AND products.status = 'active'
  ) AS product_counts ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object(
        'name', product_sample.name,
        'slug', product_sample.slug,
        'mainImageUrl', product_sample.main_image_url,
        'price', product_sample.price
      )
      ORDER BY product_sample.created_at DESC
    ) AS sample_products
    FROM (
      SELECT
        products.name,
        products.slug,
        products.price::float AS price,
        main_image.image_url AS main_image_url,
        products.created_at
      FROM products
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
      WHERE products.seller_id = stores.seller_id
        AND products.tenant_id = sellers.tenant_id
        AND products.status = 'active'
      ORDER BY products.created_at DESC
      LIMIT 3
    ) AS product_sample
  ) AS sample_products ON true
`;

export async function listPublicStores(
  filters: StoresFiltersInput,
): Promise<PublicStore[]> {
  const { values, whereClauses } = buildStoreFilters(filters);
  const result = await db.query<StoreRow>(
    `
      SELECT ${storeSelectColumns}
      FROM stores
      ${storePublicJoins}
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY md5(stores.id::text || CURRENT_DATE::text)
    `,
    values,
  );

  return result.rows.map(mapStoreRow);
}

export async function findPublicStoreBySlug(
  slug: string,
): Promise<PublicStoreDetail | null> {
  const storeResult = await db.query<StoreRow>(
    `
      SELECT ${storeSelectColumns}
      FROM stores
      ${storePublicJoins}
      WHERE stores.status = 'active'
        AND sellers.validation_status = 'approved'
        AND stores.slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const storeRow = storeResult.rows[0];

  if (!storeRow) {
    return null;
  }

  const productsResult = await db.query<StoreProductRow>(
    `
      SELECT
        products.id,
        products.category_id,
        categories.name AS category_name,
        categories.slug AS category_slug,
        products.name,
        products.slug,
        products.description,
        products.price,
        products.stock,
        products.material,
        products.color,
        products.size,
        main_image.image_url AS main_image_url,
        products.created_at
      FROM stores
      INNER JOIN sellers ON sellers.id = stores.seller_id
      INNER JOIN products ON products.seller_id = sellers.id
        AND products.tenant_id = sellers.tenant_id
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
      WHERE stores.slug = $1
        AND stores.status = 'active'
        AND sellers.validation_status = 'approved'
        AND products.status = 'active'
        AND categories.status = 'active'
      ORDER BY products.created_at DESC
    `,
    [slug],
  );

  return {
    ...mapStoreRow(storeRow),
    products: productsResult.rows.map(mapStoreProductRow),
  };
}
