import { HttpError } from "../../utils/http-error";
import type { AuthUser } from "../auth/auth.repository";
import {
  findBuyerProfileByUserId,
  updateBuyerProfileByUserId,
} from "./buyers.repository";
import type { UpdateBuyerProfileInput } from "./buyers.schemas";

export async function getMyBuyerProfile(user: AuthUser) {
  if (user.role !== "buyer") {
    throw new HttpError(403, "Buyer role is required");
  }

  const buyer = await findBuyerProfileByUserId(user.id);

  if (!buyer) {
    throw new HttpError(404, "Buyer profile was not found");
  }

  return buyer;
}

export async function updateMyBuyerProfile(
  user: AuthUser,
  input: UpdateBuyerProfileInput,
) {
  if (user.role !== "buyer") {
    throw new HttpError(403, "Buyer role is required");
  }

  const buyer = await updateBuyerProfileByUserId(user.id, input);

  if (!buyer) {
    throw new HttpError(404, "Buyer profile was not found");
  }

  return buyer;
}
