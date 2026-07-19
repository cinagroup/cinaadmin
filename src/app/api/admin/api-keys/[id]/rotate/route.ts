import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/api-keys/[id]/rotate — rotate an API key.
 * Deletes the old key and creates a new one. The new plaintext key is
 * returned (shown once). Requires super_admin.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await resolveAdminSession(request);
	if (!session || !hasAdminRole(session.role) || session.role !== "super_admin") {
		return NextResponse.json({ ok: false }, { status: 403 });
	}
	// Consume request body to prevent request smuggling.
	// No validation needed: this is an action-only route (no body expected).
	await request.json().catch(() => ({}));
	const { id } = await params;
	const cookie = request.headers.get("cookie") ?? "";

	// Delete the old key first (ignore errors if already gone).
	await cinaauthFetch(`/api-key/delete`, {
		method: "POST",
		body: { keyId: id },
		cookie,
	});

	// Create a new key.
	const newKey = await cinaauthFetch<{ key: string }>(`/api-key/create`, {
		method: "POST",
		body: { name: `rotated-${Date.now()}` },
		cookie,
	});

	return NextResponse.json(newKey, { status: newKey.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
