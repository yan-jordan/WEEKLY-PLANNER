import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { ApiError, notFound } from "@/lib/http";
import type { loginSchema, signupSchema } from "@/lib/validation";

export const DEFAULT_AVAILABILITY = [4, 4, 4, 4, 4, 2, 2];

const publicUser = { id: true, email: true, name: true, availability: true, createdAt: true } as const;
export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUser }>;

export async function createUser(input: z.infer<typeof signupSchema>): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await db.user.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: publicUser,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(409, "email_taken", "An account with this email already exists.");
    }
    throw err;
  }
}

/** Returns the user for valid credentials. Same error for unknown email and wrong password. */
export async function authenticate(input: z.infer<typeof loginSchema>): Promise<PublicUser> {
  const user = await db.user.findUnique({ where: { email: input.email } });
  const ok = await verifyPassword(input.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok) throw new ApiError(401, "invalid_credentials", "Invalid email or password.");
  return { id: user.id, email: user.email, name: user.name, availability: user.availability, createdAt: user.createdAt };
}

export async function getUser(userId: string): Promise<PublicUser> {
  const user = await db.user.findUnique({ where: { id: userId }, select: publicUser });
  if (!user) throw notFound("User");
  return user;
}

/** Availability as 7 numbers, Monday first. Falls back to the default for legacy/empty rows. */
export async function getAvailability(userId: string): Promise<number[]> {
  const { availability } = await getUser(userId);
  return availability.length === 7 ? availability : DEFAULT_AVAILABILITY;
}

export async function setAvailability(userId: string, availability: number[]): Promise<number[]> {
  const user = await db.user.update({ where: { id: userId }, data: { availability }, select: publicUser });
  return user.availability;
}
