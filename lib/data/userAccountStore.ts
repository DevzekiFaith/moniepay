import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

export interface StoredUserAccount {
  id: string;
  email: string;
  phone?: string;
  name: string;
  businessName: string;
  marketLocation?: string;
  avatarUrl?: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string;
}

interface UserAccountStoreData {
  users: Record<string, StoredUserAccount>;
}

function resolveUserStoreFile(): string {
  const directPrisma = path.join(process.cwd(), "prisma");
  const nestedPrisma = path.join(process.cwd(), "monielite", "prisma");
  if (fs.existsSync(nestedPrisma)) {
    return path.join(nestedPrisma, "registered_users.json");
  }
  return path.join(directPrisma, "registered_users.json");
}

const USER_STORE_FILE = resolveUserStoreFile();

// In-memory cache so serverless / read-only environments also retain state across warm invocations
const memoryUsers: Record<string, StoredUserAccount> = {};

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

function readUserStore(): Record<string, StoredUserAccount> {
  try {
    if (fs.existsSync(USER_STORE_FILE)) {
      const raw = fs.readFileSync(USER_STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as UserAccountStoreData;
      if (parsed?.users && typeof parsed.users === "object") {
        return { ...parsed.users, ...memoryUsers };
      }
    }
  } catch (err) {
    console.warn("Could not read registered_users.json:", err);
  }
  return { ...memoryUsers };
}

function writeUserStore(users: Record<string, StoredUserAccount>): void {
  Object.assign(memoryUsers, users);
  try {
    const dir = path.dirname(USER_STORE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_STORE_FILE, JSON.stringify({ users }, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write registered_users.json (using memory store):", err);
  }
}

/**
 * Find a previously registered / signed-in user by email or phone number.
 */
export async function findRegisteredUser(identifier: string): Promise<StoredUserAccount | null> {
  const key = normalizeIdentifier(identifier);
  if (!key) return null;

  // 1. Check local file + memory store
  const store = readUserStore();
  if (store[key]) {
    return store[key];
  }

  // Also search by phone or email field across stored records
  const matchedInStore = Object.values(store).find(
    (u) =>
      normalizeIdentifier(u.email) === key ||
      (u.phone && normalizeIdentifier(u.phone) === key)
  );
  if (matchedInStore) {
    return matchedInStore;
  }

  // 2. Check Prisma User table
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: key },
    });
    if (dbUser) {
      const hydrated: StoredUserAccount = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || "Shop Owner",
        businessName: `${dbUser.name || "Shop Owner"}'s Business`,
        passwordHash: dbUser.passwordHash,
        createdAt: dbUser.createdAt.toISOString(),
        lastLoginAt: dbUser.updatedAt.toISOString(),
      };
      memoryUsers[key] = hydrated;
      return hydrated;
    }
  } catch {
    // Prisma table might not be migrated or available in all environments
  }

  return null;
}

/**
 * Save or update a registered / signed-in user account so future sign-ins can verify their identity.
 */
export async function saveRegisteredUser(params: {
  id: string;
  email: string;
  phone?: string;
  name: string;
  businessName: string;
  marketLocation?: string;
  avatarUrl?: string;
  password: string;
}): Promise<StoredUserAccount> {
  const key = normalizeIdentifier(params.email);
  const passwordHash = await bcrypt.hash(params.password, 10);
  const now = new Date().toISOString();

  const store = readUserStore();
  const existing = store[key];

  const account: StoredUserAccount = {
    id: existing?.id || params.id,
    email: key,
    phone: params.phone || existing?.phone,
    name: params.name || existing?.name || "Shop Owner",
    businessName: params.businessName || existing?.businessName || `${params.name}'s Business`,
    marketLocation: params.marketLocation ?? existing?.marketLocation,
    avatarUrl: params.avatarUrl ?? existing?.avatarUrl,
    passwordHash,
    createdAt: existing?.createdAt || now,
    lastLoginAt: now,
  };

  store[key] = account;
  if (params.phone) {
    store[normalizeIdentifier(params.phone)] = account;
  }
  writeUserStore(store);

  // Also persist to Prisma User table if available
  try {
    await prisma.user.upsert({
      where: { email: key },
      update: {
        name: account.name,
        passwordHash,
      },
      create: {
        id: account.id,
        email: key,
        name: account.name,
        passwordHash,
      },
    });
  } catch {
    // Ignore Prisma errors if running without SQLite/Postgres write access
  }

  return account;
}

/**
 * Verify a user's sign-in credentials against previously registered / signed-in users.
 * Throws or returns structured status distinguishing unregistered users from invalid passwords.
 */
export async function verifyUserSignIn(
  identifier: string,
  password: string
): Promise<
  | { status: "SUCCESS"; user: StoredUserAccount }
  | { status: "NOT_REGISTERED"; message: string }
  | { status: "INVALID_PASSWORD"; message: string }
> {
  const existingUser = await findRegisteredUser(identifier);

  if (!existingUser) {
    return {
      status: "NOT_REGISTERED",
      message:
        "We couldn't find an account with this email or phone number. If you are new here, please tap 'Register New Shop' to create your account first.",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
  if (!isPasswordValid) {
    return {
      status: "INVALID_PASSWORD",
      message:
        "Wrong password. Please check your password and try again.",
    };
  }

  // Update lastLoginAt timestamp
  const key = normalizeIdentifier(existingUser.email);
  const store = readUserStore();
  const updatedUser: StoredUserAccount = {
    ...existingUser,
    lastLoginAt: new Date().toISOString(),
  };
  store[key] = updatedUser;
  writeUserStore(store);

  return {
    status: "SUCCESS",
    user: updatedUser,
  };
}

