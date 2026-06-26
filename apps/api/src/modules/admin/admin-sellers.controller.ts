import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  approveSeller,
  getAdminSellers,
  rejectSeller,
  suspendSeller,
} from "./admin-sellers.service";
import {
  adminSellersQuerySchema,
  rejectSellerSchema,
} from "./admin-sellers.schemas";

function parseInput<T>(schema: ZodSchema<T>, value: unknown, label: string): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      throw new HttpError(400, `Invalid ${label}: ${details}`);
    }

    throw error;
  }
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

function getSellerIdParam(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new HttpError(400, "Seller id is required");
  }

  return id;
}

export const listAdminSellersController = asyncHandler(async (req, res) => {
  const filters = parseInput(adminSellersQuerySchema, req.query, "query");
  const sellers = await getAdminSellers(filters);

  res.status(200).json({ sellers });
});

export const approveSellerController = asyncHandler(async (req, res) => {
  const seller = await approveSeller(getSellerIdParam(req));

  res.status(200).json({ seller });
});

export const rejectSellerController = asyncHandler(async (req, res) => {
  parseInput(rejectSellerSchema, req.body, "request body");

  const seller = await rejectSeller(getSellerIdParam(req));

  res.status(200).json({ seller });
});

export const suspendSellerController = asyncHandler(async (req, res) => {
  const seller = await suspendSeller(getSellerIdParam(req));

  res.status(200).json({ seller });
});
