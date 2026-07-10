import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** GET /api/admin/sessions — proxy cinaauth list-sessions (global).
 *  NOTE: cinaauth's admin plugin exposes per-user session listing
 *  (`/admin/list-user-sessions`) but not a global list. This endpoint may 404
 *  until the backend adds it; degrade gracefully to an empty list rather than
 *  surfacing a 502 that could break the console. */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	const qs = new URL(request.url).searchParams.toString();
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch(`/admin/list-sessions?${qs}`, { cookie });
	// Endpoint not yet implemented on cinaauth → return empty so the page
	// renders an empty state instead of erroring.
	if (!res.ok) {
		return NextResponse.json({ ok: true, data: { sessions: [] } });
	}
	return NextResponse.json(res, { status: 200 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
