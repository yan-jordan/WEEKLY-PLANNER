import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | undefined;

/**
 * When a login uses an unknown email we still run a bcrypt comparison against this hash,
 * so the response time doesn't reveal which emails are registered.
 */
export function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash(crypto.randomUUID(), COST);
  return dummyHash;
}
