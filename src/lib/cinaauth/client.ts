import { cinaauthConfig } from "./config";
import type { StandardResponse } from "./types";

/**
 * Server-side fetch wrapper for cinaauth admin endpoints. Attaches the service
 * key (identifies the console caller; does not bypass cinaauth's role checks)
 * and forwards the admin's session cookie so the acting user is recorded.
 *
 * Paths are relative to the cinaauth base (e.g. "/admin/list-users") and are
 * prefixed with "/api/auth" because Better Auth mounts its routes there — so
 * the resolved URL becomes `${baseUrl}/api/auth/admin/list-users`.
 *
 * Use from Server Components (reads) and Route Handlers (mutations).
 */
export async function cinaauthFetch<T>(
	path: string,
	opts: {
		method?: "GET" | "POST" | "PATCH" | "DELETE";
		body?: unknown;
		cookie?: string;
		headers?: Record<string, string>;
	} = {},
): Promise<StandardResponse<T>> {
	const headers: Record<string, string> = {
		authorization: `Bearer ${cinaauthConfig.serviceKey}`,
	};
	if (opts.cookie) headers.cookie = opts.cookie;
	if (opts.body !== undefined) headers["content-type"] = "application/json";
	if (opts.headers) Object.assign(headers, opts.headers);

	// Ensure the path is mounted under the Better Auth handler ("/api/auth").
	const mountPath = path.startsWith("/api/auth") ? path : `/api/auth${path}`;

	try {
		const res = await fetch(`${cinaauthConfig.baseUrl}${mountPath}`, {
			method: opts.method ?? "GET",
			headers,
			body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
			cache: "no-store",
			next: { revalidate: 0 },
		});
		const data = (await res.json().catch(() => null)) as T | null;
		if (!res.ok || data === null) {
			return {
				ok: false,
				error: {
					code: `CINAUTH_${res.status}`,
					message: `cinaauth ${path} failed`,
				},
			};
		}
		return { ok: true, data };
	} catch (err) {
		return {
			ok: false,
			error: { code: "CINAUTH_UNREACHABLE", message: String(err) },
		};
	}
}
