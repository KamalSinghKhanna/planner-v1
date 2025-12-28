import type { IdentityRecord, AuthContextPayload } from "./identity.types";
import {
  ensureUserByEmail,
  getUserById,
  getUserByEmail
} from "./identity.repo";

const DEFAULT_ROLES = ["user"] as const;

export const getIdentity = async (userId: string): Promise<IdentityRecord | null> =>
  getUserById(userId);

export const resolveIdentityByEmail = async (
  email: string
): Promise<IdentityRecord | null> => getUserByEmail(email);

export const ensureIdentity = async (
  email: string,
  name?: string
): Promise<IdentityRecord> => ensureUserByEmail(email, name);

export const buildAuthPayload = (
  identity: IdentityRecord,
  roles: string[] = [...DEFAULT_ROLES]
): AuthContextPayload => ({
  userId: identity.id,
  roles,
  issuedAt: Date.now()
});
