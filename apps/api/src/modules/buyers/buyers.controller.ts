import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { HttpError } from "../../utils/http-error";
import {
  getMyBuyerProfile,
  updateMyBuyerProfile,
} from "./buyers.service";
import { updateBuyerProfileSchema } from "./buyers.schemas";

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

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "Authentication is required");
  }

  return req.user;
}

export const getMyBuyerProfileController = asyncHandler(async (req, res) => {
  const buyer = await getMyBuyerProfile(requireUser(req));

  res.status(200).json({ buyer });
});

export const updateMyBuyerProfileController = asyncHandler(async (req, res) => {
  const body = parseBody(updateBuyerProfileSchema, req.body);
  const buyer = await updateMyBuyerProfile(requireUser(req), body);

  res.status(200).json({ buyer });
});
