import { type NextRequest, NextResponse } from "next/server";
import {
	ADMIN_AND_SECURITY,
	requireAdmin,
	requireRole,
} from "@/lib/auth-guard";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/sessions/revoke — revoke a single session or all sessions
 * for a user.
 *
 * Body `{ sessionId }` → revoke one. Body `{ userId }` → revoke all for user.
 */
export async function POST(request: NextRequest) {
	const session = await requireAdmin(request).catch((e: Response) => e);
	if (session instanceof Response) return session;
	try {
		requireRole(session, ADMIN_AND_SECURITY);
	} catch (e) {
		return e as Response;
	}
	const body = await request.json();
	const cookie = request.headers.get("cookie") ?? "";

	const path = body.userId
		? "/admin/revoke-user-sessions"
		: "/admin/revoke-session";
	const res = await cinaauthFetch(path, { method: "POST", body, cookie });
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
