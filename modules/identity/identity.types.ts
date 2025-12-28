export interface IdentityRecord {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthContextPayload {
  userId: string;
  roles: string[];
  issuedAt: number;
}
