import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** GET /api/admin/subscriptions — list subscriptions. */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) return NextResponse.json({ ok: false }, { status: 403 });
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch("/subscription/list", { cookie });
	if (!res.ok) return NextResponse.json({ ok: true, data: { subscriptions: [] } });
	return NextResponse.json(res, { status: 200 });
}

/** POST /api/admin/subscriptions — upgrade, cancel, or get billing portal URL. */
export async function POST(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	const body = await request.json().catch(() => ({}));
	const { action } = body as { action?: string };
	const cookie = request.headers.get("cookie") ?? "";

	let endpoint = "/subscription/cancel";
	if (action === "upgrade") endpoint = "/subscription/upgrade";
	else if (action === "portal") endpoint = "/subscription/billing-portal";

	const res = await cinaauthFetch(endpoint, { method: "POST", body, cookie });
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

export const runtime = "edge";
