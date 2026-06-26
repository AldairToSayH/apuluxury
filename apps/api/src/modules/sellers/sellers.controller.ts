import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  getMySellerProfile,
  updateMySellerProfile,
} from "./sellers.service";
import { updateSellerProfileSchema } from "./sellers.schemas";

function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      throw new HttpError(400, `Invalid request body: ${details}`);
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

export const getMySellerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Authentication is required");
  }

  const seller = await getMySellerProfile(req.user);

  res.status(200).json({ seller });
});

export const updateMySellerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Authentication is required");
  }

  const body = parseBody(updateSellerProfileSchema, req.body);
  const seller = await updateMySellerProfile(req.user, body);

  res.status(200).json({ seller });
});
