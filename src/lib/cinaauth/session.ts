import { cinaauthConfig } from "./config";
import type { AdminSession } from "./types";

/**
 * Resolve the cinaauth admin session from a Next.js Request by forwarding the
 * session cookie to cinaauth's /api/get-session. Returns null if there is no
 * valid session or the call fails.
 *
 * Used by middleware and Route Handlers (second-layer access enforcement).
 */
export async function resolveAdminSession(
	request: Request,
): Promise<AdminSession | null> {
	const cookie = request.headers.get("cookie") ?? "";
	if (!cookie) return null;
	try {
		const res = await fetch(`${cinaauthConfig.baseUrl}/api/get-session`, {
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
