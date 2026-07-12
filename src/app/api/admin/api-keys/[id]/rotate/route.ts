import { type NextRequest, NextResponse } from "next/server";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";
import { cinaauthFetch } from "@/lib/cinaauth/client";

/**
 * POST /api/admin/api-keys/[id]/rotate — rotate an API key.
 * Deletes the old key and creates a new one with the same name/prefix.
 * Returns the new plaintext key (shown once). Requires super_admin.
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
	const cookie = request.headers.get("cookie") ?? "";

	// Step 1: get the old key's metadata (name, prefix).
	const oldKey = await cinaauthFetch<{ name?: string; prefix?: string }>(
		`/api-key/get`,
		{ method: "POST", body: { keyId: id }, cookie },
	);
	if (!oldKey.ok) {
		return NextResponse.json({ ok: false, error: "Key not found" }, { status: 404 });
	}

	// Step 2: delete the old key.
	await cinaauthFetch(`/api-key/delete`, {
		method: "POST",
		body: { keyId: id },
		cookie,
	});

	// Step 3: create a new key with the same name.
	const newKey = await cinaauthFetch<{ key: string }>(`/api-key/create`, {
		method: "POST",
		body: {
			name: oldKey.data?.name ?? "rotated-key",
			prefix: oldKey.data?.prefix,
		},
		cookie,
	});

	return NextResponse.json(newKey, { status: newKey.ok ? 200 : 502 });
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
