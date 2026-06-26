import { HttpError } from "../../utils/http-error";
import type { AuthUser } from "../auth/auth.repository";
import {
  findSellerProfileByUserId,
  updateSellerProfileByUserId,
} from "./sellers.repository";
import type { UpdateSellerProfileInput } from "./sellers.schemas";

export async function getMySellerProfile(user: AuthUser) {
  if (user.role !== "seller") {
    throw new HttpError(403, "Seller role is required");
  }

  const seller = await findSellerProfileByUserId(user.id);

  if (!seller) {
    throw new HttpError(404, "Seller profile was not found");
  }

  return seller;
}

export async function updateMySellerProfile(
  user: AuthUser,
  input: UpdateSellerProfileInput,
) {
  if (user.role !== "seller") {
    throw new HttpError(403, "Seller role is required");
  }

  const seller = await updateSellerProfileByUserId(user.id, input);

  if (!seller) {
    throw new HttpError(404, "Seller profile was not found");
  }

  return seller;
}
