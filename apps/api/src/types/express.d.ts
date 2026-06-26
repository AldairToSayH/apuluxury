import type { AuthUser, SellerProfile } from "../modules/auth/auth.repository";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      user?: AuthUser;
      seller?: SellerProfile;
      sellerId?: string;
      tenantId?: string;
    }
  }
}

export {};
