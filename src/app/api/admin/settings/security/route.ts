import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";

/**
 * GET /api/admin/settings/security — return the current security policy view.
 *
 * v1: cinaauth exposes no single global security-config endpoint, so this
 * returns the documented defaults (read-only view). Edits are applied in
 * auth.cinagroup.com config / D1 settings until a writable endpoint lands.
 */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	return NextResponse.json({
		ok: true,
		data: {
			otpTtl: "15m",
			otpDailyMax: 10,
			lockoutThreshold: 5,
			banDuration: "permanent",
			force2fa: { cinacoin: false, cinatoken: false },
			trustedOrigins: [] as string[],
		},
	});
}
