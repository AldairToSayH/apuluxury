import { db } from "../../config/db";
import type { BuyerProfile } from "../auth/auth.repository";
import type { UpdateBuyerProfileInput } from "./buyers.schemas";

type BuyerRow = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  dni: string | null;
  phone: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
};

const buyerSelectColumns = `
  id,
  user_id,
  first_name,
  last_name,
  dni,
  phone,
  address,
  created_at,
  updated_at
`;

function mapBuyerRow(row: BuyerRow): BuyerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dni: row.dni,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findBuyerProfileByUserId(
  userId: string,
): Promise<BuyerProfile | null> {
  const result = await db.query<BuyerRow>(
    `
      SELECT ${buyerSelectColumns}
      FROM buyers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapBuyerRow(row) : null;
}

export async function updateBuyerProfileByUserId(
  userId: string,
  input: UpdateBuyerProfileInput,
): Promise<BuyerProfile | null> {
  const result = await db.query<BuyerRow>(
    `
      UPDATE buyers
      SET
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        dni = COALESCE($4, dni),
        phone = COALESCE($5, phone),
        address = COALESCE($6, address)
      WHERE user_id = $1
      RETURNING ${buyerSelectColumns}
    `,
    [
      userId,
      input.first_name,
      input.last_name,
      input.dni,
      input.phone,
      input.address,
    ],
  );

  const row = result.rows[0];

  return row ? mapBuyerRow(row) : null;
}
