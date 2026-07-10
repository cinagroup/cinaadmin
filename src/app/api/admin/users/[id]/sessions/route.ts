import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** GET /api/admin/users/[id]/sessions — proxy list-user-sessions.
 *  cinaauth's admin plugin exposes this as POST /admin/list-user-sessions. */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch("/admin/list-user-sessions", {
		method: "POST",
		body: { userId: id },
		cookie,
	});
	// Degrade gracefully — the endpoint may not be available.
	if (!res.ok) {
		return NextResponse.json({ ok: true, data: { sessions: [] } });
	}
	return NextResponse.json(res, { status: 200 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
