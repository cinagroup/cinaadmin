import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

beforeEach(() => {
	vi.stubEnv("CINAADMIN_ALLOWED_ROLES", "super_admin,security_admin");
	vi.stubEnv("CINAUTH_BASE_URL", "https://auth.test");
});

/**
 * Run the middleware default export against a fake request whose cookie
 * resolves to the given cinaauth response.
 */
async function runMiddleware(opts: {
	pathname: string;
	role: string | undefined;
	cinaauthStatus?: number;
}): Promise<Response> {
	vi.resetModules();
	vi.spyOn(globalThis, "fetch").mockResolvedValue(
		new Response(
			opts.role ? JSON.stringify({ user: { role: opts.role } }) : "{}",
			{ status: opts.cinaauthStatus ?? (opts.role ? 200 : 401) },
		),
	);
	const mod = await import("@/middleware");
	const middleware = (mod as { middleware: (req: NextRequest) => Promise<Response> }).middleware;
	const req = new NextRequest(new URL(`https://admin.test${opts.pathname}`), {
		headers: { cookie: "s=1" },
	});
	return middleware(req);
}

describe("middleware access control", () => {
	it("redirects non-allowed roles to cinaauth sign-in", async () => {
		const res = await runMiddleware({ pathname: "/users", role: "user" });
		expect(res.status).toBeGreaterThanOrEqual(300);
		expect(res.headers.get("location") ?? "").toContain("/sign-in");
	});

	it("redirects when unauthenticated (no role)", async () => {
		const res = await runMiddleware({
			pathname: "/users",
			role: undefined,
			cinaauthStatus: 401,
		});
		expect(res.status).toBeGreaterThanOrEqual(300);
	});

	it("allows super_admin through", async () => {
		const res = await runMiddleware({ pathname: "/users", role: "super_admin" });
		expect(res.status).toBe(200);
	});

	it("allows security_admin through", async () => {
		const res = await runMiddleware({
			pathname: "/audit",
			role: "security_admin",
		});
		expect(res.status).toBe(200);
	});

	it("returns 401 JSON for api paths when unauthenticated", async () => {
		const res = await runMiddleware({
			pathname: "/api/admin/session",
			role: undefined,
			cinaauthStatus: 401,
		});
		expect(res.status).toBe(401);
		const body = (await res.json()) as { ok: boolean };
		expect(body.ok).toBe(false);
	});

	it("passes through public paths without a cinaauth call", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch");
		const mod = await import("@/middleware");
		const middleware = (mod as { middleware: (req: NextRequest) => Promise<Response> }).middleware;
		const req = new NextRequest(new URL("https://admin.test/sign-in"));
		const res = await middleware(req);
		expect(res.status).toBe(200);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
