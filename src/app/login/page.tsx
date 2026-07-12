"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
	const { t } = useI18n();
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackURL = searchParams.get("callbackURL") ?? "/dashboard";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const resp = await fetch(
				`${process.env.NEXT_PUBLIC_CINAUTH_BASE_URL ?? "https://auth.cinagroup.com"}/api/auth/sign-in/email`,
				{
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ email, password, callbackURL }),
					credentials: "include",
				},
			);
			const data = await resp.json();
			if (resp.ok) {
				// Cookie is set on .cinagroup.com — navigate to the callback URL.
				router.push(callbackURL);
				router.refresh();
			} else {
				setError(data?.message ?? data?.error?.message ?? "Login failed");
			}
		} catch {
			setError("Network error");
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
