import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
	reactStrictMode: true,
	env: {
		NEXT_PUBLIC_CINAUTH_BASE_URL:
			process.env.NEXT_PUBLIC_CINAUTH_BASE_URL ??
			"https://auth.cinagroup.com",
		NEXT_PUBLIC_CINAUTH_AUTH_URL:
			process.env.NEXT_PUBLIC_CINAUTH_AUTH_URL ??
			"https://demo-auth.cinagroup.com",
	},
};

export default nextConfig;
