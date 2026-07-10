"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function NewUserPage() {
	const { t } = useI18n();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		const r = await fetch("/api/admin/users/create", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, name, password }),
		});
		setSubmitting(false);
		if (r.ok) {
			router.push("/users");
		} else {
			const d = (await r.json().catch(() => null)) as {
				error?: { message?: string };
			} | null;
			setError(d?.error?.message ?? t("users.create.failed"));
		}
	};

	return (
		<div className="max-w-md">
			<PageHeader title={t("users.create.manual")} backHref="/users" backLabel={t("users.back")} />
			<Card>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">{t("users.col.email")}</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="name">{t("users.col.name")}</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">{t("users.create.password")}</Label>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						{error && (
							<div className="text-[14px] leading-5 text-error">{error}</div>
						)}
						<Button type="submit" disabled={submitting}>
							{submitting ? t("common.creating") : t("users.create")}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
