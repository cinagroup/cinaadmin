import { NextResponse, type NextRequest } from "next/server";
import { cinaauthConfig } from "@/lib/cinaauth/config";

/** Paths that bypass the admin role gate. */
const PUBLIC_PATHS = ["/sign-in", "/api/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
		return NextResponse.next();
	}

	// Verify the session + role at the edge by asking cinaauth. Cookie is
	// forwarded as-is (shared .cinagroup.com session domain).
	// NOTE: this intentionally inlines the role check rather than reusing
	// `resolveAdminSession` — the edge middleware only needs `user.role`, and
	// keeping the edge bundle minimal avoids pulling the full session DTO path.
	// If cinaauth's /api/get-session response shape changes, update both here
	// and in src/lib/cinaauth/session.ts.
	const cookie = request.headers.get("cookie") ?? "";
	let role: string | undefined;
	try {
		const res = await fetch(`${cinaauthConfig.baseUrl}/api/get-session`, {
			headers: { cookie },
			cache: "no-store",
		});
		if (res.ok) {
			const data = (await res.json()) as { user?: { role?: string } | null };
			role = data.user?.role;
		}
	} catch {
		/* network error → treat as unauthenticated */
	}

	if (!role || !cinaauthConfig.allowedRoles.includes(role)) {
		if (pathname.startsWith("/api/")) {
			return NextResponse.json(
				{ ok: false, error: { code: "UNAUTHORIZED", message: "role not allowed" } },
				{ status: 401 },
			);
		}
		const signInUrl = new URL(`${cinaauthConfig.baseUrl}/sign-in`);
		signInUrl.searchParams.set("callbackURL", request.url);
		return NextResponse.redirect(signInUrl);
	}
	return NextResponse.next();
}

export const config = {
	// Run on everything except Next's static asset internals.
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
