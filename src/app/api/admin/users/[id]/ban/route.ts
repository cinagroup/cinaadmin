import { type NextRequest, NextResponse } from "next/server";
import {
	ADMIN_AND_SECURITY,
	requireAdmin,
	requireRole,
} from "@/lib/auth-guard";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** POST /api/admin/users/[id]/ban — ban user (7d/30d/permanent + reason). */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const session = await requireAdmin(request).catch((e: Response) => e);
	if (session instanceof Response) return session;
	try {
		requireRole(session, ADMIN_AND_SECURITY);
	} catch (e) {
		return e as Response;
	}
	const body = await request.json();
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch("/admin/ban-user", {
		method: "POST",
		body: { userId: id, ...body },
		cookie,
	});
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
