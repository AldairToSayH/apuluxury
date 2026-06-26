import type { AuthUser, BuyerProfile, SellerProfile } from "../auth/auth.repository";
import { findBuyerByUserId } from "../auth/auth.repository";
import { HttpError } from "../../utils/http-error";
import {
  createOrderFromActiveCart,
  findOrderDetailById,
  findPublicTrackedOrder,
  findSellerOrderDetailByTenant,
  listAdminOrders,
  listOrdersForBuyer,
  listSellerOrdersForTenant,
  updateSellerOrderStatusForTenant,
} from "./orders.repository";
import type {
  AdminOrderFiltersInput,
  BuyerOrderFiltersInput,
  CreateOrderInput,
  SellerOrderFiltersInput,
  UpdateSellerOrderStatusInput,
  TrackOrderQueryInput,
} from "./orders.schemas";

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

export async function createOrderForBuyer(
  user: AuthUser,
  input: CreateOrderInput,
) {
  const buyer = await getBuyerProfileOrThrow(user);

  return createOrderFromActiveCart({
    buyerId: buyer.id,
    userId: user.id,
    delivery: input,
  });
}

export async function getBuyerOrders(
  user: AuthUser,
  filters: BuyerOrderFiltersInput,
) {
  const buyer = await getBuyerProfileOrThrow(user);

  return listOrdersForBuyer(buyer.id, filters);
}

export async function getBuyerOrderDetail(user: AuthUser, orderId: string) {
  const buyer = await getBuyerProfileOrThrow(user);
  const order = await findOrderDetailById(orderId, buyer.id);

  if (!order) {
    throw new HttpError(404, "Order was not found");
  }

  return order;
}

export function getSellerOrders(
  seller: SellerProfile,
  filters: SellerOrderFiltersInput,
) {
  return listSellerOrdersForTenant(seller.tenantId, filters);
}

export async function getSellerOrderDetail(
  seller: SellerProfile,
  sellerOrderId: string,
) {
  const sellerOrder = await findSellerOrderDetailByTenant(
    sellerOrderId,
    seller.tenantId,
  );

  if (!sellerOrder) {
    throw new HttpError(404, "Seller order was not found");
  }

  return sellerOrder;
}

export async function updateSellerOrderStatus(
  user: AuthUser,
  seller: SellerProfile,
  sellerOrderId: string,
  input: UpdateSellerOrderStatusInput,
) {
  const sellerOrder = await updateSellerOrderStatusForTenant({
    sellerOrderId,
    tenantId: seller.tenantId,
    status: input.status,
    changedBy: user.id,
    note: input.note,
  });

  if (!sellerOrder) {
    throw new HttpError(404, "Seller order was not found");
  }

  return sellerOrder;
}

export function getAdminOrders(filters: AdminOrderFiltersInput) {
  return listAdminOrders(filters);
}

export async function getAdminOrderDetail(orderId: string) {
  const order = await findOrderDetailById(orderId);

  if (!order) {
    throw new HttpError(404, "Order was not found");
  }

  return order;
}

export async function trackPublicOrder(input: TrackOrderQueryInput) {
  return findPublicTrackedOrder(input.orderCode, input.phone);
}
