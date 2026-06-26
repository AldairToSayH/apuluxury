import type { RequestHandler } from "express";

import { findSellerProfileByUserId } from "../modules/sellers/sellers.repository";
import { HttpError } from "../utils/http-error";

export const loadSellerTenant: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Authentication is required");
    }

    if (req.user.role !== "seller") {
      throw new HttpError(403, "Seller role is required");
    }

    const seller = await findSellerProfileByUserId(req.user.id);

    if (!seller) {
      throw new HttpError(404, "Seller profile was not found");
    }

    req.seller = seller;
    req.sellerId = seller.id;
    req.tenantId = seller.tenantId;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireApprovedSeller: RequestHandler = (req, _res, next) => {
  if (!req.seller) {
    next(new HttpError(403, "Seller profile is required"));
    return;
  }

  if (req.seller.validationStatus !== "approved") {
    next(new HttpError(403, "Seller account is not approved"));
    return;
  }

  next();
};

export function requireTenantAccess(getTenantId: (req: Express.Request) => string | undefined): RequestHandler {
  return (req, _res, next) => {
    const requestedTenantId = getTenantId(req);

    if (!req.tenantId || !requestedTenantId) {
      next(new HttpError(403, "Tenant context is required"));
      return;
    }

    if (req.tenantId !== requestedTenantId) {
      next(new HttpError(403, "Tenant access denied"));
      return;
    }

    next();
  };
}
