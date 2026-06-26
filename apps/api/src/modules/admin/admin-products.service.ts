import { HttpError } from "../../utils/http-error";
import type { ProductStatus } from "../products/products.repository";
import {
  findAdminProductById,
  listAdminProducts,
  updateAdminProductModeration,
  updateAdminProductStatus,
  type AdminProductFilters,
} from "./admin-products.repository";

type DatabaseError = Error & {
  code?: string;
};

function mapDatabaseError(error: unknown): never {
  if (error instanceof Error && "code" in error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23503") {
      throw new HttpError(400, "Related category does not exist");
    }
  }

  throw error;
}

export function getAdminProducts(filters: AdminProductFilters) {
  return listAdminProducts(filters);
}

export async function getAdminProductDetail(productId: string) {
  const product = await findAdminProductById(productId);

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return product;
}

export async function changeAdminProductStatus(input: {
  productId: string;
  status: ProductStatus;
  note?: string;
}) {
  const product = await updateAdminProductStatus(input.productId, input.status);

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return {
    product,
    ...(input.note && { note: input.note }),
  };
}

export async function updateAdminProductModerationFields(input: {
  productId: string;
  status?: ProductStatus;
  categoryId?: string;
}) {
  try {
    const product = await updateAdminProductModeration(input);

    if (!product) {
      throw new HttpError(404, "Product was not found");
    }

    return product;
  } catch (error) {
    mapDatabaseError(error);
  }
}
