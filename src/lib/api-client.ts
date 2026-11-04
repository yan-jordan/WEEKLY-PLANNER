/** Small fetch wrapper for client components: JSON in, JSON out, readable error messages. */
export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields: Record<string, string> = {};
    for (const d of data?.error?.details ?? []) fields[d.path] ??= d.message;
    throw new ClientApiError(data?.error?.message ?? `Request failed (${res.status})`, res.status, fields);
  }
  return data as T;
}
