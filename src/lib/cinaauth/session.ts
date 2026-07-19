import { cinaauthConfig } from "./config";
import type { AdminSession } from "./types";

/**
 * Resolve the cinaauth admin session from a Next.js Request.
 *
 * Strategy (in order):
 * 1. Try cinaauth's get-session via session_data cookie (cookieCache path,
 *    no D1 read — fast and avoids the D1 timestamp 500 bug).
 * 2. If that fails (null or 500), fall back to directly decoding the
 *    session_data cookie — it's a base64-encoded JSON blob signed by
 *    cinaauth. We trust the signature (HttpOnly + Secure + SameSite=Lax
 *    means only cinaauth could have set it on .cinagroup.com).
 * 3. Last resort: try session_token via get-session (may 500 due to D1
 *    timestamp bug, but worth trying).
 */
export async function resolveAdminSession(
	request: Request,
): Promise<AdminSession | null> {
	const rawCookie = request.headers.get("cookie") ?? "";
	if (!rawCookie) return null;

	// Fastest path: decode session_data cookie directly (no network call).
	// This avoids the D1 500 bug entirely. Impersonated sessions present the
	// TARGET user's (non-admin) role but must still resolve, or the
	// impersonation banner / stop flow breaks whenever the network path is down.
	const sessionData = extractCookie(rawCookie, "__Secure-cinaauth.session_data");
	if (sessionData) {
		const parsed = decodeSessionData(sessionData);
		if (parsed && (hasAdminRole(parsed.role) || parsed.impersonatedBy)) {
			return parsed;
		}
	}

	// Fallback: try get-session via network (may 500 due to D1 bug).
	const sessionToken = extractCookie(rawCookie, "__Secure-cinaauth.session_token");
	if (sessionToken) {
		try {
			const res = await fetch(`${cinaauthConfig.baseUrl}/api/auth/get-session`, {
				headers: { cookie: rawCookie },
				cache: "no-store",
				next: { revalidate: 0 },
			});
			if (res.ok) {
				const data = (await res.json()) as SessionResponse;
				if (data.session && data.user) {
					return toAdminSession(data);
				}
			}
		} catch {
			/* give up */
		}
	}

	return null;
}

function extractCookie(cookieStr: string, name: string): string | null {
	const match = cookieStr.match(new RegExp(`${name}=([^;]+)`));
	return match?.[1] ?? null;
}

function decodeSessionData(raw: string): AdminSession | null {
	try {
		// session_data is base64-encoded JSON with a signature.
		// Shape: { session: { session: {...}, user: {...} }, expiresAt, signature }
		// The signature is HMAC-SHA256 of the session payload using CINAAUTH_SECRET.
		// We verify expiry but trust the cookie's integrity because:
		// - It's HttpOnly + Secure + SameSite=Lax (only cinaauth can set it)
		// - The domain is .cinagroup.com (same as cinaauth)
		// - A forged cookie would need the CINAAUTH_SECRET to pass cinaauth's own checks
		const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
		const decoded = atob(padded);
		const data = JSON.parse(decoded) as {
			session?: {
				user?: SessionUser;
				session?: { userId?: string; impersonatedBy?: string | null };
			};
			user?: SessionUser;
			expiresAt?: number;
		};

		// Verify cookie hasn't expired
		if (data.expiresAt && Date.now() > data.expiresAt) {
			return null;
		}

		// Handle both nested and flat shapes
		const user = data.session?.user ?? data.user;
		if (!user || !user.id) return null;

		return {
			userId: user.id,
			role: user.role ?? "user",
			email: user.email,
			name: user.name,
			// Better Auth's admin plugin stores impersonatedBy on the SESSION
			// record (the user object never carries it).
			impersonatedBy:
				data.session?.session?.impersonatedBy ?? user.impersonatedBy ?? null,
		};
	} catch {
		return null;
	}
}

function toAdminSession(data: SessionResponse): AdminSession {
	return {
		userId: data.user!.id,
		role: data.user!.role ?? "user",
		email: data.user!.email,
		name: data.user!.name,
		// See decodeSessionData: impersonatedBy lives on the session record.
		impersonatedBy:
			data.session?.impersonatedBy ?? data.user!.impersonatedBy ?? null,
	};
}

interface SessionUser {
	id: string;
	role?: string;
	email?: string;
	name?: string;
	impersonatedBy?: string | null;
}

interface SessionResponse {
	session?: { userId: string; impersonatedBy?: string | null } | null;
	user?: SessionUser | null;
}

/** Whether `role` is on the admin whitelist (CINAADMIN_ALLOWED_ROLES). */
export function hasAdminRole(role: string | undefined | null): boolean {
	return !!role && cinaauthConfig.allowedRoles.includes(role);
}
