import type { AuthUser, BuyerProfile } from "../auth/auth.repository";
import { findBuyerByUserId } from "../auth/auth.repository";
import { HttpError } from "../../utils/http-error";
import {
  clearActiveCartItems,
  deleteCartItemForBuyer,
  findCartItemByCartAndProduct,
  findCartItemForBuyer,
  findProductForCart,
  getCartDetails,
  getOrCreateActiveCart,
  insertCartItem,
  updateCartItemQuantity,
  type CartDetails,
  type ProductForCart,
} from "./cart.repository";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.schemas";

async function getBuyerProfileOrThrow(user: AuthUser): Promise<BuyerProfile> {
  if (user.role !== "buyer") {
    throw new HttpError(403, "Buyer role is required");
  }

  const buyer = await findBuyerByUserId(user.id);

  if (!buyer) {
    throw new HttpError(404, "Buyer profile was not found");
  }

  return buyer;
}

async function getActiveCartDetails(buyerId: string): Promise<CartDetails> {
  const cart = await getOrCreateActiveCart(buyerId);

  return getCartDetails(cart);
}

function assertProductCanBeAdded(product: ProductForCart): void {
  if (product.status !== "active") {
    throw new HttpError(400, "Product is not active");
  }

  if (product.sellerValidationStatus !== "approved") {
    throw new HttpError(400, "Product seller is not approved");
  }
}

function assertStock(quantity: number, stock: number): void {
  if (quantity > stock) {
    throw new HttpError(400, "Requested quantity exceeds available stock");
  }
}

export async function getMyCart(user: AuthUser): Promise<CartDetails> {
  const buyer = await getBuyerProfileOrThrow(user);

  return getActiveCartDetails(buyer.id);
}

export async function addItemToMyCart(
  user: AuthUser,
  input: AddCartItemInput,
): Promise<CartDetails> {
  const buyer = await getBuyerProfileOrThrow(user);
  const cart = await getOrCreateActiveCart(buyer.id);
  const product = await findProductForCart(input.product_id);

  if (!product) {
    throw new HttpError(404, "Product was not found");
  }

  assertProductCanBeAdded(product);

  const existingItem = await findCartItemByCartAndProduct(
    cart.id,
    product.id,
  );
  const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

  assertStock(nextQuantity, product.stock);

  if (existingItem) {
    await updateCartItemQuantity(existingItem.id, nextQuantity);
  } else {
    await insertCartItem({
      cartId: cart.id,
      product,
      quantity: input.quantity,
    });
  }

  return getCartDetails(cart);
}

export async function updateMyCartItem(
  user: AuthUser,
  cartItemId: string,
  input: UpdateCartItemInput,
): Promise<CartDetails> {
  const buyer = await getBuyerProfileOrThrow(user);
  const cart = await getOrCreateActiveCart(buyer.id);
  const item = await findCartItemForBuyer(cartItemId, buyer.id);

  if (!item) {
    throw new HttpError(404, "Cart item was not found");
  }

  assertStock(input.quantity, item.productStock);
  await updateCartItemQuantity(item.id, input.quantity);

  return getCartDetails(cart);
}

export async function deleteMyCartItem(
  user: AuthUser,
  cartItemId: string,
): Promise<CartDetails> {
  const buyer = await getBuyerProfileOrThrow(user);
  const cart = await getOrCreateActiveCart(buyer.id);
  const deleted = await deleteCartItemForBuyer(cartItemId, buyer.id);

  if (!deleted) {
    throw new HttpError(404, "Cart item was not found");
  }

  return getCartDetails(cart);
}

export async function clearMyCart(user: AuthUser): Promise<CartDetails> {
  const buyer = await getBuyerProfileOrThrow(user);
  const cart = await getOrCreateActiveCart(buyer.id);

  await clearActiveCartItems(buyer.id);

  return getCartDetails(cart);
}
