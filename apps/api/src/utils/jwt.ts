import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { AuthUser } from "../modules/auth/auth.repository";
import { HttpError } from "./http-error";

export type AuthJwtPayload = {
  id: string;
  userId: string;
  role: AuthUser["role"];
  email: string;
  name?: string;
};

export function signAuthToken(
  user: Pick<AuthUser, "id" | "role" | "email"> & { name?: string },
): string {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      role: user.role,
      email: user.email,
      ...(user.name && { name: user.name }),
    } satisfies AuthJwtPayload,
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyAuthToken(token: string): AuthJwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload !== "object" ||
      (typeof payload.userId !== "string" && typeof payload.id !== "string") ||
      typeof payload.email !== "string" ||
      !["buyer", "seller", "admin"].includes(String(payload.role))
    ) {
      throw new HttpError(401, "Invalid authentication token");
    }

    const userId =
      typeof payload.userId === "string" ? payload.userId : String(payload.id);

    return {
      id: userId,
      userId,
      role: payload.role as AuthJwtPayload["role"],
      email: payload.email,
      ...(typeof payload.name === "string" && { name: payload.name }),
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "Invalid or expired authentication token");
  }
}
