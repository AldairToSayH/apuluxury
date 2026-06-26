import { HttpError } from "../../utils/http-error";
import type { AdminSellersQueryInput } from "./admin-sellers.schemas";
import {
  listSellers,
  updateSellerValidationStatus,
} from "./admin-sellers.repository";

export function getAdminSellers(filters: AdminSellersQueryInput) {
  return listSellers(filters);
}

export async function approveSeller(sellerId: string) {
  return updateStatusOrThrow(sellerId, "approved");
}

export async function rejectSeller(sellerId: string) {
  return updateStatusOrThrow(sellerId, "rejected");
}

export async function suspendSeller(sellerId: string) {
  return updateStatusOrThrow(sellerId, "suspended");
}

async function updateStatusOrThrow(
  sellerId: string,
  status: "approved" | "rejected" | "suspended",
) {
  const seller = await updateSellerValidationStatus(sellerId, status);

  if (!seller) {
    throw new HttpError(404, "Seller was not found");
  }

  return seller;
}
