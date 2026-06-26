import { db } from "../../config/db";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: Category["status"];
  created_at: Date;
  updated_at: Date;
};

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listActiveCategories(): Promise<Category[]> {
  const result = await db.query<CategoryRow>(
    `
      SELECT id, name, slug, description, status, created_at, updated_at
      FROM categories
      WHERE status = 'active'
      ORDER BY name ASC
    `,
  );

  return result.rows.map(mapCategoryRow);
}
