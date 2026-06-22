import { type NextRequest } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

const esc = (v: unknown): string => {
	const s = v == null ? "" : String(v);
	return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * GET /api/admin/export?kind=users|audit
 *
 * Stream the filtered data as CSV. For `users` we map the JSON list-users
 * response to CSV; for `audit` cinaauth already returns CSV text from
 * /audit/export (we forward it).
 */
export async function GET(request: NextRequest) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role)) {
		return new Response("forbidden", { status: 403 });
	}
	const { searchParams } = new URL(request.url);
	const kind = searchParams.get("kind") ?? "users";
	const cookie = request.headers.get("cookie") ?? "";

	if (kind === "audit") {
		const res = await cinaauthFetch<string>(`/audit/export?${searchParams}`, {
			cookie,
		});
		const csv = typeof res.data === "string" ? res.data : "";
		return new Response(csv, {
			headers: {
				"content-type": "text/csv; charset=utf-8",
				"content-disposition": `attachment; filename="audit-${Date.now()}.csv"`,
			},
		});
	}

	// users
	const res = await cinaauthFetch<{ users: Record<string, unknown>[] }>(
		`/admin/list-users?${searchParams}&limit=10000`,
		{ cookie },
	);
	if (!res.ok || !res.data) return new Response("upstream error", { status: 502 });
	const cols = ["id", "email", "name", "role", "banned", "createdAt"];
	const lines = [
		cols.join(","),
		...res.data.users.map((u) => cols.map((c) => esc(u[c])).join(",")),
	];
	return new Response(lines.join("\n"), {
		headers: {
			"content-type": "text/csv; charset=utf-8",
			"content-disposition": `attachment; filename="users-${Date.now()}.csv"`,
		},
	});
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
