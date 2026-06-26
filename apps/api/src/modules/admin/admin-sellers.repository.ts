import { db } from "../../config/db";
import type { SellerProfile } from "../auth/auth.repository";
import type { AdminSellersQueryInput } from "./admin-sellers.schemas";

export type AdminSeller = SellerProfile & {
  userEmail: string;
};

type AdminSellerRow = {
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
  user_email: string;
};

function mapAdminSellerRow(row: AdminSellerRow): AdminSeller {
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
    userEmail: row.user_email,
  };
}

const adminSellerSelectColumns = `
  sellers.id,
  sellers.user_id,
  sellers.tenant_id,
  sellers.commercial_name,
  sellers.slug,
  sellers.ruc,
  sellers.phone,
  sellers.address,
  sellers.business_description,
  sellers.validation_status,
  sellers.created_at,
  sellers.updated_at,
  users.email AS user_email
`;

export async function listSellers(
  filters: AdminSellersQueryInput,
): Promise<AdminSeller[]> {
  const whereClauses: string[] = [];
  const values: string[] = [];

  if (filters.validation_status) {
    values.push(filters.validation_status);
    whereClauses.push(`sellers.validation_status = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(
      `(sellers.commercial_name ILIKE $${values.length} OR sellers.slug ILIKE $${values.length} OR users.email ILIKE $${values.length})`,
    );
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await db.query<AdminSellerRow>(
    `
      SELECT ${adminSellerSelectColumns}
      FROM sellers
      INNER JOIN users ON users.id = sellers.user_id
      ${whereSql}
      ORDER BY sellers.created_at DESC
    `,
    values,
  );

  return result.rows.map(mapAdminSellerRow);
}

export async function updateSellerValidationStatus(
  sellerId: string,
  validationStatus: SellerProfile["validationStatus"],
): Promise<AdminSeller | null> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<AdminSellerRow>(
      `
        UPDATE sellers
        SET validation_status = $2
        FROM users
        WHERE sellers.id = $1
          AND users.id = sellers.user_id
        RETURNING ${adminSellerSelectColumns}
      `,
      [sellerId, validationStatus],
    );

    const row = result.rows[0];

    if (!row) {
      await client.query("ROLLBACK");
      return null;
    }

    const storeStatus =
      validationStatus === "approved"
        ? "active"
        : validationStatus === "suspended"
          ? "suspended"
          : validationStatus === "pending"
            ? "pending"
            : "inactive";

    await client.query(
      `
        UPDATE stores
        SET status = $2
        WHERE seller_id = $1
      `,
      [sellerId, storeStatus],
    );

    await client.query("COMMIT");

    return mapAdminSellerRow(row);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
