import { cinaauthConfig } from "./config";
import type { AdminSession } from "./types";

/**
 * Resolve the cinaauth admin session from a Next.js Request by forwarding the
 * session cookie to cinaauth's /api/auth/get-session. Returns null if there is
 * no valid session or the call fails.
 *
 * IMPORTANT: cinaauth's D1 drizzle adapter crashes (500) when the session_token
 * cookie triggers a D1 read with incompatible timestamp formatting. The
 * cookieCache feature (session_data cookie) avoids this by serving the session
 * from a signed cookie without a DB read. However, when BOTH session_token and
 * session_data are present, cinaauth prefers session_token and crashes.
 *
 * Fix: strip the session_token cookie from the forwarded header so only
 * session_data (the cookieCache variant) is sent to get-session. This avoids
 * the D1 read entirely while still authenticating the user.
 */
export async function resolveAdminSession(
	request: Request,
): Promise<AdminSession | null> {
	const rawCookie = request.headers.get("cookie") ?? "";
	if (!rawCookie) return null;

	// Strip session_token (keep session_data) to avoid the D1 500 crash.
	const cookie = rawCookie
		.split(";")
		.map((c) => c.trim())
		.filter((c) => {
			// Keep session_data and all non-session cookies
			// Remove session_token and multi-session variants
			if (c.startsWith("__Secure-cinaauth.session_token")) {
				return c.startsWith("__Secure-cinaauth.session_data");
			}
			return true;
		})
		.join("; ");

	if (!cookie) return null;
	try {
		const res = await fetch(`${cinaauthConfig.baseUrl}/api/auth/get-session`, {
			headers: { cookie },
			cache: "no-store",
			next: { revalidate: 0 },
		});
		if (!res.ok) return null;
		const data = (await res.json()) as {
			session?: { userId: string } | null;
			user?: {
				id: string;
				role?: string;
				email?: string;
				name?: string;
				impersonatedBy?: string | null;
			} | null;
		};
		if (!data.session || !data.user) return null;
		return {
			userId: data.user.id,
			role: data.user.role ?? "user",
			email: data.user.email,
			name: data.user.name,
			impersonatedBy: data.user.impersonatedBy ?? null,
		};
	} catch {
		return null;
	}
}

/** Whether `role` is on the admin whitelist (CINAADMIN_ALLOWED_ROLES). */
export function hasAdminRole(role: string | undefined | null): boolean {
	return !!role && cinaauthConfig.allowedRoles.includes(role);
}
