import type { RequestHandler } from "express";

import { findUserById } from "../modules/auth/auth.repository";
import { getAuthCookie } from "../utils/auth-cookie";
import { HttpError } from "../utils/http-error";
import { verifyAuthToken } from "../utils/jwt";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.header("Authorization");

    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : null;
    const token = bearerToken || getAuthCookie(req);

    if (!token) {
      throw new HttpError(401, "Authentication token is required");
    }

    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.userId);

    if (!user) {
      throw new HttpError(401, "Authenticated user was not found");
    }

    if (user.status !== "active") {
      throw new HttpError(403, "User account is not active");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
