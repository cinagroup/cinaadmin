import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireRole, SUPER_ADMIN_ONLY } from "@/lib/auth-guard";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/** POST /api/admin/users/impersonate/stop — stop impersonation. */
export async function POST(request: NextRequest) {
	const session = await requireAdmin(request).catch((e: Response) => e);
	if (session instanceof Response) return session;
	try {
		requireRole(session, SUPER_ADMIN_ONLY);
	} catch (e) {
		return e as Response;
	}
	const cookie = request.headers.get("cookie") ?? "";
	const res = await cinaauthFetch("/admin/stop-impersonating", {
		method: "POST",
		cookie,
	});
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
