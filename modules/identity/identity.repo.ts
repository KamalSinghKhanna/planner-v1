import { query } from "../../db/index";
import type { IdentityRecord } from "./identity.types";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

const toIdentityRecord = (row: UserRow): IdentityRecord => ({
  id: row.id,
  email: row.email,
  name: row.name,
  createdAt: row.created_at
});

export const getUserById = async (id: string): Promise<IdentityRecord | null> => {
  const { rows } = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  return toIdentityRecord(rows[0]);
};

export const getUserByEmail = async (email: string): Promise<IdentityRecord | null> => {
  const { rows } = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (!rows.length) {
    return null;
  }

  return toIdentityRecord(rows[0]);
};

export const createUser = async (email: string, name?: string): Promise<IdentityRecord> => {
  const { rows } = await query<UserRow>(
    `
      INSERT INTO users (email, name)
      VALUES ($1, $2)
      RETURNING *
    `,
    [email, name ?? null]
  );

  if (!rows.length) {
    throw new Error("Failed to create identity record");
  }

  return toIdentityRecord(rows[0]);
};

export const ensureUserByEmail = async (
  email: string,
  name?: string
): Promise<IdentityRecord> => {
  const existing = await getUserByEmail(email);
  if (existing) {
    return existing;
  }

  return createUser(email, name);
};
