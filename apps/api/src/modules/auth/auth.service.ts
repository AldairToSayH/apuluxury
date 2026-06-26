import { signAuthToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { HttpError } from "../../utils/http-error";
import {
  createGoogleBuyerAccount,
  createBuyerAccount,
  createSellerAccount,
  findBuyerByUserId,
  findSellerByUserId,
  findStoreBySellerId,
  findUserByEmail,
  findUserById,
  linkGoogleUserIfMissing,
  type AuthUser,
  type BuyerProfile,
  type SellerProfile,
  type StoreProfile,
} from "./auth.repository";
import type {
  LoginInput,
  RegisterBuyerInput,
  RegisterSellerInput,
} from "./auth.schemas";

type DatabaseError = Error & {
  code?: string;
  constraint?: string;
};

export type SafeUser = {
  id: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
  role: AuthUser["role"];
  status: AuthUser["status"];
  createdAt: Date;
  updatedAt: Date;
};

export type SafeStore = {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: StoreProfile["status"];
  createdAt: Date;
  updatedAt: Date;
};

function toSafeUser(user: AuthUser): SafeUser {
  return {
    id: user.id,
    email: user.email,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toSafeStore(store: StoreProfile): SafeStore {
  return {
    id: store.id,
    sellerId: store.sellerId,
    name: store.name,
    slug: store.slug,
    subdomain: store.subdomain,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    status: store.status,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}

function assertActiveUser(user: AuthUser): void {
  if (user.status !== "active") {
    throw new HttpError(403, "User account is not active");
  }
}

function isUniqueViolation(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as DatabaseError).code === "23505"
  );
}

function mapUniqueViolation(error: unknown): never {
  if (isUniqueViolation(error)) {
    if (error.constraint === "users_email_key") {
      throw new HttpError(409, "Email is already registered");
    }

    if (error.constraint === "idx_users_google_id_unique") {
      throw new HttpError(409, "Google account is already linked");
    }

    if (error.constraint === "sellers_slug_key") {
      throw new HttpError(409, "Seller slug is already registered");
    }

    if (error.constraint === "idx_stores_slug_unique") {
      throw new HttpError(409, "Store slug is already registered");
    }

    if (error.constraint === "idx_stores_subdomain_unique") {
      throw new HttpError(409, "Store subdomain is already registered");
    }

    if (error.constraint === "idx_sellers_ruc_unique") {
      throw new HttpError(409, "Seller RUC is already registered");
    }

    throw new HttpError(409, "A record with those values already exists");
  }

  throw error;
}

export async function registerBuyer(input: RegisterBuyerInput) {
  const passwordHash = await hashPassword(input.password);

  try {
    const { user, buyer } = await createBuyerAccount({
      ...input,
      passwordHash,
    });

    return {
      user: toSafeUser(user),
      buyer,
      token: signAuthToken(user),
    };
  } catch (error) {
    mapUniqueViolation(error);
  }
}

export async function registerSeller(input: RegisterSellerInput) {
  const passwordHash = await hashPassword(input.password);

  try {
    const { user, seller, store } = await createSellerAccount({
      ...input,
      passwordHash,
    });

    return {
      user: toSafeUser(user),
      seller,
      store: toSafeStore(store),
      token: signAuthToken(user),
    };
  } catch (error) {
    mapUniqueViolation(error);
  }
}

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user?.passwordHash) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isValidPassword = await comparePassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password");
  }

  assertActiveUser(user);

  return {
    user: toSafeUser(user),
    token: signAuthToken(user),
  };
}

export async function loginWithGoogle(input: {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const email = input.email.toLowerCase();

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      assertActiveUser(existingUser);

      if (existingUser.role !== "buyer") {
        throw new HttpError(403, "Google login is only available for buyers");
      }

      const linkedUser = await linkGoogleUserIfMissing({
        userId: existingUser.id,
        googleId: input.googleId,
        avatarUrl: input.avatarUrl,
      });

      return {
        user: toSafeUser(linkedUser),
        token: signAuthToken({ ...linkedUser, name: input.displayName }),
      };
    }

    const { user, buyer } = await createGoogleBuyerAccount({
      ...input,
      email,
    });

    return {
      user: toSafeUser(user),
      buyer,
      token: signAuthToken({ ...user, name: input.displayName }),
    };
  } catch (error) {
    mapUniqueViolation(error);
  }
}

export async function getCurrentUser(userId: string): Promise<{
  user: SafeUser;
  buyer?: BuyerProfile;
  seller?: SellerProfile;
  store?: SafeStore;
}> {
  const user = await findUserById(userId);

  if (!user) {
    throw new HttpError(401, "Authenticated user was not found");
  }

  assertActiveUser(user);

  if (user.role === "buyer") {
    const buyer = await findBuyerByUserId(user.id);

    return {
      user: toSafeUser(user),
      ...(buyer && { buyer }),
    };
  }

  if (user.role === "seller") {
    const seller = await findSellerByUserId(user.id);
    const store = seller ? await findStoreBySellerId(seller.id) : null;

    return {
      user: toSafeUser(user),
      ...(seller && { seller }),
      ...(store && { store: toSafeStore(store) }),
    };
  }

  return {
    user: toSafeUser(user),
  };
}
