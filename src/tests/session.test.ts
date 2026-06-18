import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasAdminRole, resolveAdminSession } from "@/lib/cinaauth/session";

beforeEach(() => {
	vi.stubEnv("CINAADMIN_ALLOWED_ROLES", "super_admin,security_admin");
	vi.stubEnv("CINAUTH_BASE_URL", "https://auth.test");
});

describe("hasAdminRole", () => {
	it("allows whitelisted roles, rejects others", () => {
		expect(hasAdminRole("super_admin")).toBe(true);
		expect(hasAdminRole("security_admin")).toBe(true);
		expect(hasAdminRole("admin")).toBe(false);
		expect(hasAdminRole("user")).toBe(false);
		expect(hasAdminRole(undefined)).toBe(false);
		expect(hasAdminRole(null)).toBe(false);
	});
});

describe("resolveAdminSession", () => {
	it("returns null when no cookie is present", async () => {
		const req = new Request("https://admin.test/api/x");
		expect(await resolveAdminSession(req)).toBeNull();
	});

	it("returns null when cinaauth responds non-200", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("{}", { status: 401 }));
		const req = new Request("https://admin.test/api/x", {
			headers: { cookie: "s=1" },
		});
		expect(await resolveAdminSession(req)).toBeNull();
		fetchMock.mockRestore();
	});

	it("returns a session when cinaauth responds 200 with session+user", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					session: { userId: "u1" },
					user: { id: "u1", role: "super_admin", email: "a@b.c" },
				}),
				{ status: 200 },
			),
		);
		const req = new Request("https://admin.test/api/x", {
			headers: { cookie: "s=1" },
		});
		const session = await resolveAdminSession(req);
		expect(session?.userId).toBe("u1");
		expect(session?.role).toBe("super_admin");
		expect(session?.email).toBe("a@b.c");
		fetchMock.mockRestore();
	});

	it("returns null when fetch throws (cinaauth unreachable)", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockRejectedValue(new Error("network"));
		const req = new Request("https://admin.test/api/x", {
			headers: { cookie: "s=1" },
		});
		expect(await resolveAdminSession(req)).toBeNull();
		fetchMock.mockRestore();
	});
});
