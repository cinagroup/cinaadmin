/**
 * Runtime config for the cinaauth integration. Values come from environment
 * (Cloudflare Pages secrets in prod, .env.local in dev).
 */
function required(name: string, fallback?: string): string {
	const v = process.env[name] ?? fallback;
	if (!v) {
		throw new Error(`Missing required env: ${name}`);
	}
	return v;
}

export const cinaauthConfig = {
	baseUrl: required("CINAUTH_BASE_URL", "http://localhost:2025"),
	serviceKey: required("CINAUTH_ADMIN_SERVICE_KEY", "dev-service-key"),
	allowedRoles: (process.env.CINAADMIN_ALLOWED_ROLES ?? "super_admin,security_admin")
		.split(",")
		.map((r) => r.trim())
		.filter(Boolean),
};
