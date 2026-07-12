import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * GET /api/admin/settings/security — return the current security policy view.
 *
 * Fetches the live rate-limit configuration from cinaauth's
 * /admin/rate-limit-config endpoint. Other policy fields (otpTtl,
 * lockoutThreshold, etc.) are documented defaults that are set at deploy
 * time via environment variables and CinaAuth options.
 */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}

	// Fetch live rate-limit config from the auth Worker.
	const cookie = request.headers.get("cookie") ?? "";
	const rlRes = await cinaauthFetch<{
		enabled: boolean;
		window: number;
		max: number;
		storage: string;
		customRules: Record<string, unknown>;
	}>(`/admin/rate-limit-config`, { cookie });

	const rateLimit = rlRes.ok ? rlRes.data : null;

	return NextResponse.json({
		ok: true,
		data: {
			rateLimit: rateLimit
				? {
						enabled: rateLimit.enabled,
						window: rateLimit.window,
						max: rateLimit.max,
						storage: rateLimit.storage,
					}
				: null,
			// These are compile-time / deploy-time constants (read-only).
			otpTtl: "15m",
			otpDailyMax: 10,
			lockoutThreshold: 5,
			banDuration: "permanent",
			force2fa: { cinacoin: false, cinatoken: false },
			trustedOrigins: [] as string[],
		},
	});
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
