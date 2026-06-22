"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function NewUserPage() {
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
			setError(d?.error?.message ?? "创建失败");
		}
	};

	return (
		<div className="max-w-md">
			<PageHeader title="手动建号" />
			<Card>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="email">邮箱</Label>
							<Input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="name">用户名</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">密码</Label>
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
							{submitting ? "创建中…" : "创建用户"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
