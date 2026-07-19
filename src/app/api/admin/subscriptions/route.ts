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

export const runtime = "edge";
