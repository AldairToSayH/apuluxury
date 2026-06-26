import type { SellerProfile } from "../auth/auth.repository";
import { HttpError } from "../../utils/http-error";
import {
  createProductImage,
  deleteProductImageByTenant,
  findProductOwnerByTenant,
  listProductImagesByTenant,
  setMainProductImageByTenant,
  updateProductImageByTenant,
} from "./product-images.repository";
import type {
  CreateProductImageInput,
  UpdateProductImageInput,
} from "./product-images.schemas";

async function getOwnedProductOrThrow(productId: string, seller: SellerProfile) {
  const product = await findProductOwnerByTenant({
    productId,
    tenantId: seller.tenantId,
  });

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  return product;
}

export async function addProductImage(
  seller: SellerProfile,
  productId: string,
  input: CreateProductImageInput,
) {
  const product = await getOwnedProductOrThrow(productId, seller);

  return createProductImage({
    productId,
    tenantId: seller.tenantId,
    sellerId: product.seller_id,
    image: input,
  });
}

export async function getProductImages(seller: SellerProfile, productId: string) {
  await getOwnedProductOrThrow(productId, seller);

  return listProductImagesByTenant({
    productId,
    tenantId: seller.tenantId,
  });
}

export async function updateProductImage(
  seller: SellerProfile,
  productId: string,
  imageId: string,
  input: UpdateProductImageInput,
) {
  await getOwnedProductOrThrow(productId, seller);

  const image = await updateProductImageByTenant({
    productId,
    imageId,
    tenantId: seller.tenantId,
    image: input,
  });

  if (!image) {
    throw new HttpError(404, "Product image was not found");
  }

  return image;
}

export async function setMainProductImage(
  seller: SellerProfile,
  productId: string,
  imageId: string,
) {
  await getOwnedProductOrThrow(productId, seller);

  const image = await setMainProductImageByTenant({
    productId,
    imageId,
    tenantId: seller.tenantId,
  });

  if (!image) {
    throw new HttpError(404, "Product image was not found");
  }

  return image;
}

export async function deleteProductImage(
  seller: SellerProfile,
  productId: string,
  imageId: string,
) {
  await getOwnedProductOrThrow(productId, seller);

  const deleted = await deleteProductImageByTenant({
    productId,
    imageId,
    tenantId: seller.tenantId,
  });

  if (!deleted) {
    throw new HttpError(404, "Product image was not found");
  }
}
