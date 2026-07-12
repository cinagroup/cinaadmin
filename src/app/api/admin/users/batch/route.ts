import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/users/batch — batch operation on multiple users.
 *
 * Body: { action: "ban" | "delete", userIds: string[] }
 *
 * Iterates over userIds and calls the corresponding cinaauth endpoint for
 * each. Not atomic — partial failures are reported. Requires super_admin.
 */
export async function POST(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}

	const body = (await request.json()) as {
		action: "ban" | "delete";
		userIds: string[];
	};

	if (!body.userIds?.length) {
		return NextResponse.json({ ok: false, error: "No userIds provided" }, { status: 400 });
	}

	const cookie = request.headers.get("cookie") ?? "";
	const results: { userId: string; ok: boolean; error?: string }[] = [];

	for (const userId of body.userIds) {
		try {
			if (body.action === "ban") {
				const res = await cinaauthFetch(`/admin/ban-user`, {
					method: "POST",
					body: { userId, banReason: "Batch ban", notify: false },
					cookie,
				});
				results.push({ userId, ok: res.ok });
			} else if (body.action === "delete") {
				const res = await cinaauthFetch(`/admin/remove-user`, {
					method: "POST",
					body: { userId },
					cookie,
				});
				results.push({ userId, ok: res.ok });
			}
		} catch (err) {
			results.push({
				userId,
				ok: false,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	const failed = results.filter((r) => !r.ok);
	return NextResponse.json({
		ok: failed.length === 0,
		data: {
			total: results.length,
			succeeded: results.length - failed.length,
			failed: failed.length,
			results,
		},
	});
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
