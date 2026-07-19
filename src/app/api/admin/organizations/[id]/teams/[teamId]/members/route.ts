import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** GET /api/admin/organizations/[id]/teams/[teamId]/members — list team members. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; teamId: string }> }) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) return NextResponse.json({ ok: false }, { status: 403 });
	const { teamId } = await params;
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch(`/organization/list-team-members`, { method: "POST", body: { teamId }, cookie });
	if (!res.ok) return NextResponse.json({ ok: true, data: { members: [] } });
	return NextResponse.json(res, { status: 200 });
}

/** POST /api/admin/organizations/[id]/teams/[teamId]/members — add a member. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; teamId: string }> }) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") return NextResponse.json({ ok: false }, { status: 403 });
	const { teamId } = await params;
	const body = await request.json().catch(() => ({}));
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch("/organization/add-team-member", { method: "POST", body: { teamId, ...body }, cookie });
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

export const runtime = "edge";
