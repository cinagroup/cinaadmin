import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * GET /api/admin/organizations/[id]/members — list organization members.
 * Forwards to cinaauth's /organization/list-members.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	const { id } = await params;
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch(`/organization/list-members`, {
		method: "POST",
		body: { organizationId: id },
		cookie,
	});
	if (!res.ok) {
		return NextResponse.json({ ok: true, data: { members: [] } });
	}
	return NextResponse.json({ ok: true, data: res.data });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
