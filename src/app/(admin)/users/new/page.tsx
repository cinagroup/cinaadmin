"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
			<h1 className="mb-4 font-serif text-xl text-gold-500">手动建号</h1>
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="mb-1 block text-sm text-muted">邮箱</label>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm text-muted">用户名</label>
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm text-muted">密码</label>
					<input
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
					/>
				</div>
				{error && <div className="text-sm text-danger">{error}</div>}
				<button
					type="submit"
					disabled={submitting}
					className="rounded bg-gold-500 px-4 py-2 text-sm text-ink-950 disabled:opacity-50"
				>
					{submitting ? "创建中…" : "创建用户"}
				</button>
			</form>
		</div>
	);
}
