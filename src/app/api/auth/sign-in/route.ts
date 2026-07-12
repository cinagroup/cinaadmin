import { type NextRequest, NextResponse } from "next/server";
import { cinaauthConfig } from "@/lib/cinaauth/config";

/**
 * POST /api/auth/sign-in — same-origin proxy for cinaauth's sign-in API.
 *
 * The embedded /login page can't call auth.cinagroup.com directly because
 * of CORS. This route proxies the request server-side (no CORS) and passes
 * the Set-Cookie header back to the browser.
 */
export async function POST(request: NextRequest) {
	const body = await request.json();
	const origin = request.headers.get("origin") ?? "https://admin.cinagroup.com";

	const resp = await fetch(
		`${cinaauthConfig.baseUrl}/api/auth/sign-in/email`,
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
				origin,
			},
			body: JSON.stringify(body),
		},
	);

	const data = await resp.json().catch(() => ({}));

	// Forward the Set-Cookie header so the session cookie is set on the browser.
	const setCookie = resp.headers.get("set-cookie");
	const headers: Record<string, string> = {
		"content-type": "application/json",
	};
	if (setCookie) {
		headers["set-cookie"] = setCookie;
	}

	return NextResponse.json(data, { status: resp.status, headers });
}

export const runtime = "edge";
