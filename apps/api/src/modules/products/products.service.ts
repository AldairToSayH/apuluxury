import { HttpError } from "../../utils/http-error";
import type { SellerProfile } from "../auth/auth.repository";
import {
  createProductForSeller,
  findProductByTenantAndId,
  listProductsByTenant,
  updateProductByTenantAndId,
  updateProductStatusByTenantAndId,
} from "./products.repository";
import type {
  CreateProductInput,
  SellerProductFiltersInput,
  UpdateProductInput,
  UpdateProductStatusInput,
} from "./products.schemas";

type DatabaseError = Error & {
  code?: string;
  constraint?: string;
};

function mapDatabaseError(error: unknown): never {
  if (error instanceof Error && "code" in error) {
    const dbError = error as DatabaseError;

    if (dbError.code === "23505") {
      throw new HttpError(409, "Product slug is already registered");
    }

    if (dbError.code === "23503") {
      throw new HttpError(400, "Related category or seller does not exist");
    }
  }

  throw error;
}

export async function createSellerProduct(
  seller: SellerProfile,
  input: CreateProductInput,
) {
  try {
    return await createProductForSeller({
      tenantId: seller.tenantId,
      sellerId: seller.id,
      product: input,
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

export function listMyProducts(
  seller: SellerProfile,
  filters: SellerProductFiltersInput,
) {
  return listProductsByTenant(seller.tenantId, filters);
}

export async function getMyProduct(seller: SellerProfile, productId: string) {
  const product = await findProductByTenantAndId(seller.tenantId, productId);

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return product;
}

export async function updateMyProduct(
  seller: SellerProfile,
  productId: string,
  input: UpdateProductInput,
) {
  try {
    const product = await updateProductByTenantAndId(
      seller.tenantId,
      productId,
      input,
    );

    if (!product) {
      throw new HttpError(404, "Product was not found");
    }

    return product;
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function updateMyProductStatus(
  seller: SellerProfile,
  productId: string,
  input: UpdateProductStatusInput,
) {
  const product = await updateProductStatusByTenantAndId(
    seller.tenantId,
    productId,
    input.status,
  );

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return product;
}
