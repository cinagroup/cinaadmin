import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/organizations/[id]/invite — invite a member by email.
 * Forwards to cinaauth's /organization/invite-member. Requires super_admin.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	const { id } = await params;
	const body = await request.json();
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch(`/organization/invite-member`, {
		method: "POST",
		body: { organizationId: id, ...body },
		cookie,
	});
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
