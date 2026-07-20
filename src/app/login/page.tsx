"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Embedded login page — bypasses the demo-auth SPA (which has a `__name is
 * not defined` hydration error that prevents the login form from rendering).
 *
 * This page lives at /login on admin.cinagroup.com itself. The middleware
 * redirects unauthenticated users here instead of to demo-auth. After a
 * successful login (via cinaauth's sign-in API), the session cookie is set
 * on .cinagroup.com and the user is redirected to /dashboard.
 */
export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}

/**
 * Post-login destinations must stay on this origin: allow a relative path
 * ("/x" but not "//host" or "/\host"), or an absolute URL on the current
 * origin (reduced to its path). Anything else — including attacker-supplied
 * ?callbackURL=https://evil.example — falls back to /dashboard. Without this,
 * a crafted login link becomes an open redirect that lands a just-signed-in
 * admin on a phishing page.
 */
export function safeCallbackURL(raw: string | null): string {
	if (!raw) return "/dashboard";
	// Reject any control character (tab, CR, LF, etc.). Browsers strip these
	// out of a URL before navigating, so "/\t/evil.com" would collapse to the
	// protocol-relative "//evil.com" AFTER the prefix checks below pass — a
	// cross-origin redirect that slips through position-based validation.
	// eslint-disable-next-line no-control-regex
	if (/[\u0000-\u001f\u007f]/.test(raw)) return "/dashboard";
	if (raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")) {
		return raw;
	}
	try {
		const u = new URL(raw);
		if (u.origin === window.location.origin) {
			return u.pathname + u.search + u.hash;
		}
	} catch {
		/* not an absolute URL either — fall through */
	}
	return "/dashboard";
}

function LoginForm() {
	const { t } = useI18n();
	const searchParams = useSearchParams();
	const rawCallback = searchParams.get("callbackURL");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		// Sanitize at submit time (window is guaranteed in the event handler).
		const callbackURL = safeCallbackURL(rawCallback);
		try {
			// Call the same-origin proxy (avoids CORS with auth.cinagroup.com).
			const resp = await fetch("/api/auth/sign-in", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ email, password, callbackURL }),
			});
			const data = await resp.json().catch(() => null);
			if (resp.ok) {
				// Cookie is set by Set-Cookie header in the proxy response.
				// Use hard navigation (not router.push) to ensure cookies are
				// persisted by the browser before the new page loads.
				window.location.href = callbackURL;
			} else {
				setError(data?.message ?? data?.error?.message ?? t("login.failed"));
			}
		} catch {
			setError(t("login.networkError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-canvas-soft px-4">
			<div className="w-full max-w-[400px]">
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-ink text-canvas-soft">
						<Shield size={24} strokeWidth={2.25} />
					</div>
					<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
						{t("login.title")}
					</h1>
					<p className="text-[14px] leading-5 text-body">
						{t("login.subtitle")}
					</p>
				</div>
				<div className="rounded-[var(--radius-lg)] border border-hairline bg-canvas p-6 shadow-card">
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">{t("login.email")}</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="admin@cinagroup.com"
								autoComplete="email"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">{t("login.password")}</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
							/>
						</div>
						{error && (
							<div className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-[14px] leading-5 text-error">
								{error}
							</div>
						)}
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? t("login.signingIn") : t("login.signIn")}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
