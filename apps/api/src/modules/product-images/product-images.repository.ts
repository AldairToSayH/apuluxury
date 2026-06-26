import type { PoolClient } from "pg";

import { db } from "../../config/db";
import type {
  CreateProductImageInput,
  UpdateProductImageInput,
} from "./product-images.schemas";

export type ProductImage = {
  id: string;
  productId: string;
  tenantId: string;
  sellerId: string;
  imageUrl: string;
  storagePath: string | null;
  altText: string | null;
  position: number;
  isMain: boolean;
  createdAt: Date;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  tenant_id: string;
  seller_id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  position: number;
  is_main: boolean;
  created_at: Date;
};

type ProductOwnerRow = {
  id: string;
  tenant_id: string;
  seller_id: string;
};

const productImageColumns = `
  id,
  product_id,
  tenant_id,
  seller_id,
  image_url,
  storage_path,
  alt_text,
  position,
  is_main,
  created_at
`;

function mapProductImageRow(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    tenantId: row.tenant_id,
    sellerId: row.seller_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    altText: row.alt_text,
    position: row.position,
    isMain: row.is_main,
    createdAt: row.created_at,
  };
}

export async function findProductOwnerByTenant(input: {
  productId: string;
  tenantId: string;
}): Promise<ProductOwnerRow | null> {
  const result = await db.query<ProductOwnerRow>(
    `
      SELECT id, tenant_id, seller_id
      FROM products
      WHERE id = $1
        AND tenant_id = $2
      LIMIT 1
    `,
    [input.productId, input.tenantId],
  );

  return result.rows[0] ?? null;
}

async function unsetMainImages(
  client: PoolClient,
  productId: string,
  tenantId: string,
): Promise<void> {
  await client.query(
    `
      UPDATE product_images
      SET is_main = false
      WHERE product_id = $1
        AND tenant_id = $2
    `,
    [productId, tenantId],
  );
}

export async function createProductImage(input: {
  productId: string;
  tenantId: string;
  sellerId: string;
  image: CreateProductImageInput;
}): Promise<ProductImage> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if (input.image.is_main === true) {
      await unsetMainImages(client, input.productId, input.tenantId);
    }

    const result = await client.query<ProductImageRow>(
      `
        INSERT INTO product_images (
          product_id,
          tenant_id,
          seller_id,
          image_url,
          storage_path,
          alt_text,
          position,
          is_main
        )
        VALUES ($1, $2, $3, $4, NULL, $5, COALESCE($6, 0), COALESCE($7, false))
        RETURNING ${productImageColumns}
      `,
      [
        input.productId,
        input.tenantId,
        input.sellerId,
        input.image.image_url,
        input.image.alt_text,
        input.image.position,
        input.image.is_main,
      ],
    );

    await client.query("COMMIT");

    return mapProductImageRow(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listProductImagesByTenant(input: {
  productId: string;
  tenantId: string;
}): Promise<ProductImage[]> {
  const result = await db.query<ProductImageRow>(
    `
      SELECT ${productImageColumns}
      FROM product_images
      WHERE product_id = $1
        AND tenant_id = $2
      ORDER BY position ASC, created_at ASC
    `,
    [input.productId, input.tenantId],
  );

  return result.rows.map(mapProductImageRow);
}

export async function updateProductImageByTenant(input: {
  productId: string;
  imageId: string;
  tenantId: string;
  image: UpdateProductImageInput;
}): Promise<ProductImage | null> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existingImage = await client.query<{ id: string }>(
      `
        SELECT id
        FROM product_images
        WHERE id = $1
          AND product_id = $2
          AND tenant_id = $3
        LIMIT 1
        FOR UPDATE
      `,
      [input.imageId, input.productId, input.tenantId],
    );

    if (!existingImage.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    if (input.image.is_main === true) {
      await unsetMainImages(client, input.productId, input.tenantId);
    }

    const result = await client.query<ProductImageRow>(
      `
        UPDATE product_images
        SET
          image_url = COALESCE($4, image_url),
          alt_text = COALESCE($5, alt_text),
          position = COALESCE($6, position),
          is_main = COALESCE($7, is_main)
        WHERE id = $1
          AND product_id = $2
          AND tenant_id = $3
        RETURNING ${productImageColumns}
      `,
      [
        input.imageId,
        input.productId,
        input.tenantId,
        input.image.image_url,
        input.image.alt_text,
        input.image.position,
        input.image.is_main,
      ],
    );

    await client.query("COMMIT");

    const row = result.rows[0];

    return row ? mapProductImageRow(row) : null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function setMainProductImageByTenant(input: {
  productId: string;
  imageId: string;
  tenantId: string;
}): Promise<ProductImage | null> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existingImage = await client.query<{ id: string }>(
      `
        SELECT id
        FROM product_images
        WHERE id = $1
          AND product_id = $2
          AND tenant_id = $3
        LIMIT 1
        FOR UPDATE
      `,
      [input.imageId, input.productId, input.tenantId],
    );

    if (!existingImage.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await unsetMainImages(client, input.productId, input.tenantId);

    const result = await client.query<ProductImageRow>(
      `
        UPDATE product_images
        SET is_main = true
        WHERE id = $1
          AND product_id = $2
          AND tenant_id = $3
        RETURNING ${productImageColumns}
      `,
      [input.imageId, input.productId, input.tenantId],
    );

    await client.query("COMMIT");

    const row = result.rows[0];

    return row ? mapProductImageRow(row) : null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteProductImageByTenant(input: {
  productId: string;
  imageId: string;
  tenantId: string;
}): Promise<boolean> {
  const result = await db.query(
    `
      DELETE FROM product_images
      WHERE id = $1
        AND product_id = $2
        AND tenant_id = $3
    `,
    [input.imageId, input.productId, input.tenantId],
  );

  return (result.rowCount ?? 0) > 0;
}
