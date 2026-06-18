import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// cinaauth service + cookie domain are configured via env at runtime.
	// Cloudflare Pages build via @cloudflare/next-on-pages (see build:cf script).
};

export default nextConfig;
