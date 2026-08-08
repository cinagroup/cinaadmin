/**
 * Runtime config for the cinaauth integration. Values come from environment
 * (Cloudflare Workers secrets in prod, .env.local in dev).
 */
function required(name: string, fallback?: string): string {
	const v = process.env[name] ?? fallback;
	if (!v) {
		throw new Error(`Missing required env: ${name}`);
	}
	return v;
}

const adminOrigin = required("CINAADMIN_ORIGIN", "http://localhost:3000");

export const cinaauthConfig = {
	/** Canonical same-origin URL for browser-facing admin requests. */
	adminOrigin,
	/** Origin cinaauth currently trusts for server-to-server proxy requests. */
	requestOrigin: required("CINAUTH_REQUEST_ORIGIN", adminOrigin),
	/** API host (auth.cinagroup.com) — session check + admin API calls. */
	baseUrl: required("CINAUTH_BASE_URL", "http://localhost:2025"),
	/** Frontend host (demo-auth.cinagroup.com) — login/sign-out page redirects. */
	authUrl: required("CINAUTH_AUTH_URL", "http://localhost:3000"),
	serviceKey: required("CINAUTH_ADMIN_SERVICE_KEY", "dev-service-key"),
	allowedRoles: (process.env.CINAADMIN_ALLOWED_ROLES ?? "super_admin,security_admin")
		.split(",")
		.map((r) => r.trim())
		.filter(Boolean),
};
