import { type NextRequest, NextResponse } from "next/server";
import {
	requireAdmin,
	requireRole,
	SUPER_ADMIN_ONLY,
} from "@/lib/auth-guard";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/users/[id]/reset-password — admin sets a new password for a
 * user. Forwards to cinaauth's /admin/set-user-password (super_admin only).
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const session = await requireAdmin(request).catch((e: Response) => e);
	if (session instanceof Response) return session;
	try {
		requireRole(session, SUPER_ADMIN_ONLY);
	} catch (e) {
		return e as Response;
	}

	const body = await request.json().catch(() => ({}));
	const { newPassword } = body as { newPassword?: string };
	if (!newPassword || newPassword.length < 8) {
		return NextResponse.json(
			{ ok: false, error: { code: "BAD_REQUEST", message: "Password must be at least 8 characters" } },
			{ status: 400 },
		);
	}

	const cookie = request.headers.get("cookie") ?? "";
	const origin = request.headers.get("origin") ?? "https://admin.cinagroup.com";
	const res = await cinaauthFetch("/admin/set-user-password", {
		method: "POST",
		body: { userId: id, newPassword },
		cookie,
		headers: { origin },
	});
	return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}

export const runtime = "edge";
