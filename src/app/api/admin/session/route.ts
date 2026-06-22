import { NextResponse, type NextRequest } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";

/**
 * GET /api/admin/session
 *
 * Second-layer access enforcement (the Route-Handler layer, on top of the edge
 * middleware). Returns the resolved admin session or 403. The client (Topbar,
 * RoleGuard) also consumes this to drive role-based UI.
 */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) {
		return NextResponse.json(
			{ ok: false, error: { code: "FORBIDDEN", message: "Insufficient role" } },
			{ status: 403 },
		);
	}
	return NextResponse.json({ ok: true, data: session });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
