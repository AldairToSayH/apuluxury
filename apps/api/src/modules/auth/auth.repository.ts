import type { PoolClient } from "pg";

import { db } from "../../config/db";
import type {
  RegisterBuyerInput,
  RegisterSellerInput,
} from "./auth.schemas";

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  authProvider: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
};

export type BuyerProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dni: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SellerProfile = {
  id: string;
  userId: string;
  tenantId: string;
  commercialName: string;
  slug: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  businessDescription: string | null;
  validationStatus: "pending" | "approved" | "rejected" | "suspended";
  createdAt: Date;
  updatedAt: Date;
};

export type StoreProfile = {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  createdAt: Date;
  updatedAt: Date;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  auth_provider: string;
  role: AuthUser["role"];
  status: AuthUser["status"];
  created_at: Date;
  updated_at: Date;
};

type BuyerRow = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  dni: string | null;
  phone: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
};

type SellerRow = {
  id: string;
  user_id: string;
  tenant_id: string;
  commercial_name: string;
  slug: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  business_description: string | null;
  validation_status: SellerProfile["validationStatus"];
  created_at: Date;
  updated_at: Date;
};

type StoreRow = {
  id: string;
  seller_id: string | null;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: StoreProfile["status"];
  created_at: Date;
  updated_at: Date;
};

function mapUserRow(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    googleId: row.google_id,
    avatarUrl: row.avatar_url,
    authProvider: row.auth_provider,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBuyerRow(row: BuyerRow): BuyerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dni: row.dni,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSellerRow(row: SellerRow): SellerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    tenantId: row.tenant_id,
    commercialName: row.commercial_name,
    slug: row.slug,
    ruc: row.ruc,
    phone: row.phone,
    address: row.address,
    businessDescription: row.business_description,
    validationStatus: row.validation_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStoreRow(row: StoreRow): StoreProfile {
  return {
    id: row.id,
    sellerId: row.seller_id,
    name: row.name,
    slug: row.slug,
    subdomain: row.subdomain,
    description: row.description,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createUser(
  client: PoolClient,
  input: {
    email: string;
    passwordHash: string;
    role: AuthUser["role"];
  },
): Promise<AuthUser> {
  const result = await client.query<UserRow>(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        email,
        password_hash,
        google_id,
        avatar_url,
        auth_provider,
        role,
        status,
        created_at,
        updated_at
    `,
    [input.email, input.passwordHash, input.role],
  );

  return mapUserRow(result.rows[0]);
}

export async function createBuyerAccount(
  input: RegisterBuyerInput & { passwordHash: string },
): Promise<{ user: AuthUser; buyer: BuyerProfile }> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const user = await createUser(client, {
      email: input.email,
      passwordHash: input.passwordHash,
      role: "buyer",
    });

    const buyerResult = await client.query<BuyerRow>(
      `
        INSERT INTO buyers (user_id, first_name, last_name, dni, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, first_name, last_name, dni, phone, address, created_at, updated_at
      `,
      [user.id, input.first_name, input.last_name, input.dni, input.phone],
    );

    await client.query("COMMIT");

    return {
      user,
      buyer: mapBuyerRow(buyerResult.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createSellerAccount(
  input: RegisterSellerInput & { passwordHash: string },
): Promise<{ user: AuthUser; seller: SellerProfile; store: StoreProfile }> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const user = await createUser(client, {
      email: input.email,
      passwordHash: input.passwordHash,
      role: "seller",
    });

    const sellerResult = await client.query<SellerRow>(
      `
        INSERT INTO sellers (
          user_id,
          commercial_name,
          slug,
          ruc,
          phone,
          address,
          business_description,
          validation_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING
          id,
          user_id,
          tenant_id,
          commercial_name,
          slug,
          ruc,
          phone,
          address,
          business_description,
          validation_status,
          created_at,
          updated_at
      `,
      [
        user.id,
        input.commercial_name,
        input.subdomain,
        input.ruc,
        input.phone,
        input.address,
        input.business_description,
      ],
    );
    const seller = mapSellerRow(sellerResult.rows[0]);

    const storeResult = await client.query<StoreRow>(
      `
        INSERT INTO stores (
          seller_id,
          name,
          slug,
          subdomain,
          description,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING
          id,
          seller_id,
          name,
          slug,
          subdomain,
          description,
          logo_url,
          banner_url,
          status,
          created_at,
          updated_at
      `,
      [
        seller.id,
        input.commercial_name,
        input.subdomain,
        input.subdomain,
        input.business_description,
      ],
    );

    await client.query("COMMIT");

    return {
      user,
      seller,
      store: mapStoreRow(storeResult.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function splitDisplayName(displayName: string, email: string) {
  const fallbackName = email.split("@")[0] || "Comprador";
  const parts = (displayName.trim() || fallbackName).split(/\s+/);
  const firstName = parts[0] || fallbackName;
  const lastName = parts.slice(1).join(" ");

  return {
    firstName,
    lastName,
  };
}

export async function createGoogleBuyerAccount(input: {
  email: string;
  googleId: string;
  displayName: string;
  avatarUrl: string | null;
}): Promise<{ user: AuthUser; buyer: BuyerProfile }> {
  const client = await db.connect();
  const { firstName, lastName } = splitDisplayName(input.displayName, input.email);

  try {
    await client.query("BEGIN");

    const userResult = await client.query<UserRow>(
      `
        INSERT INTO users (
          email,
          password_hash,
          google_id,
          avatar_url,
          auth_provider,
          role
        )
        VALUES ($1, NULL, $2, $3, 'google', 'buyer')
        RETURNING
          id,
          email,
          password_hash,
          google_id,
          avatar_url,
          auth_provider,
          role,
          status,
          created_at,
          updated_at
      `,
      [input.email, input.googleId, input.avatarUrl],
    );
    const user = mapUserRow(userResult.rows[0]);

    const buyerResult = await client.query<BuyerRow>(
      `
        INSERT INTO buyers (user_id, first_name, last_name, dni, phone)
        VALUES ($1, $2, $3, NULL, NULL)
        RETURNING id, user_id, first_name, last_name, dni, phone, address, created_at, updated_at
      `,
      [user.id, firstName, lastName],
    );

    await client.query("COMMIT");

    return {
      user,
      buyer: mapBuyerRow(buyerResult.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function linkGoogleUserIfMissing(input: {
  userId: string;
  googleId: string;
  avatarUrl: string | null;
}): Promise<AuthUser> {
  const result = await db.query<UserRow>(
    `
      UPDATE users
      SET
        google_id = COALESCE(google_id, $2),
        avatar_url = COALESCE(avatar_url, $3),
        auth_provider = CASE
          WHEN auth_provider = 'local' THEN 'google'
          ELSE auth_provider
        END
      WHERE id = $1
      RETURNING
        id,
        email,
        password_hash,
        google_id,
        avatar_url,
        auth_provider,
        role,
        status,
        created_at,
        updated_at
    `,
    [input.userId, input.googleId, input.avatarUrl],
  );

  return mapUserRow(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await db.query<UserRow>(
    `
      SELECT
        id,
        email,
        password_hash,
        google_id,
        avatar_url,
        auth_provider,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  const row = result.rows[0];

  return row ? mapUserRow(row) : null;
}

export async function findUserById(userId: string): Promise<AuthUser | null> {
  const result = await db.query<UserRow>(
    `
      SELECT
        id,
        email,
        password_hash,
        google_id,
        avatar_url,
        auth_provider,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapUserRow(row) : null;
}

export async function findBuyerByUserId(
  userId: string,
): Promise<BuyerProfile | null> {
  const result = await db.query<BuyerRow>(
    `
      SELECT id, user_id, first_name, last_name, dni, phone, address, created_at, updated_at
      FROM buyers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapBuyerRow(row) : null;
}

export async function findSellerByUserId(
  userId: string,
): Promise<SellerProfile | null> {
  const result = await db.query<SellerRow>(
    `
      SELECT
        id,
        user_id,
        tenant_id,
        commercial_name,
        slug,
        ruc,
        phone,
        address,
        business_description,
        validation_status,
        created_at,
        updated_at
      FROM sellers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  return row ? mapSellerRow(row) : null;
}

export async function findStoreBySellerId(
  sellerId: string,
): Promise<StoreProfile | null> {
  const result = await db.query<StoreRow>(
    `
      SELECT
        id,
        seller_id,
        name,
        slug,
        subdomain,
        description,
        logo_url,
        banner_url,
        status,
        created_at,
        updated_at
      FROM stores
      WHERE seller_id = $1
      LIMIT 1
    `,
    [sellerId],
  );

  const row = result.rows[0];

  return row ? mapStoreRow(row) : null;
}
