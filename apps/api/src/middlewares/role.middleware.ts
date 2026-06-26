import type { RequestHandler } from "express";

import type { AuthUser } from "../modules/auth/auth.repository";
import { HttpError } from "../utils/http-error";

export function requireRole(...roles: AuthUser["role"][]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, "Authentication is required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}
