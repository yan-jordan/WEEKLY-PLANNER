import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

/** An error that is safe to show to the client, with the HTTP status it maps to. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new ApiError(401, "unauthorized", "You need to log in first.");
export const notFound = (what = "Resource") => new ApiError(404, "not_found", `${what} not found.`);

type ErrorBody = { error: { code: string; message: string; details?: unknown } };

export function errorResponse(err: unknown): NextResponse<ErrorBody> {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "Request body or query is invalid.",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 400 },
    );
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: { code: "bad_json", message: "Body must be valid JSON." } }, { status: 400 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return NextResponse.json({ error: { code: "not_found", message: "Resource not found." } }, { status: 404 });
  }
  console.error("Unhandled API error", err);
  return NextResponse.json({ error: { code: "internal_error", message: "Something went wrong." } }, { status: 500 });
}

/**
 * Wraps a route handler so every thrown error becomes a consistent JSON error response.
 * Handlers just throw (ApiError, ZodError, ...) instead of building error responses by hand.
 */
export function route<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      return errorResponse(err);
    }
  };
}
