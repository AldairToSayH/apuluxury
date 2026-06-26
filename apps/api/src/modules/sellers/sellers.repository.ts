import { db } from "../../config/db";
import type { SellerProfile } from "../auth/auth.repository";
import type { UpdateSellerProfileInput } from "./sellers.schemas";

type SellerRow = {
  id: string;
  user_id: string;
  tenant_id: string;
  commercial_name: string;
  slug: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  business_description: string | null;
  validation_status: SellerProfile["validationStatus"];
  created_at: Date;
  updated_at: Date;
};

function mapSellerRow(row: SellerRow): SellerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    tenantId: row.tenant_id,
    commercialName: row.commercial_name,
    slug: row.slug,
    ruc: row.ruc,
    phone: row.phone,
    address: row.address,
    businessDescription: row.business_description,
    validationStatus: row.validation_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const sellerSelectColumns = `
  id,
  user_id,
  tenant_id,
  commercial_name,
  slug,
  ruc,
  phone,
  address,
  business_description,
  validation_status,
  created_at,
  updated_at
`;

export async function findSellerProfileByUserId(
  userId: string,
): Promise<SellerProfile | null> {
  const result = await db.query<SellerRow>(
    `
      SELECT ${sellerSelectColumns}
      FROM sellers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapSellerRow(row) : null;
}

export async function updateSellerProfileByUserId(
  userId: string,
  input: UpdateSellerProfileInput,
): Promise<SellerProfile | null> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<SellerRow>(
      `
        UPDATE sellers
        SET
          commercial_name = COALESCE($2, commercial_name),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address),
          business_description = COALESCE($5, business_description)
        WHERE user_id = $1
        RETURNING ${sellerSelectColumns}
      `,
      [
        userId,
        input.commercial_name,
        input.phone,
        input.address,
        input.business_description,
      ],
    );

    const row = result.rows[0];

    if (!row) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE stores
        SET
          name = COALESCE($2, name),
          description = COALESCE($3, description)
        WHERE seller_id = $1
      `,
      [row.id, input.commercial_name, input.business_description],
    );

    await client.query("COMMIT");

    return mapSellerRow(row);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
