"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface SecurityPolicy {
	otpTtl: string;
	otpDailyMax: number;
	lockoutThreshold: number;
	banDuration: string;
	force2fa: { cinacoin: boolean; cinatoken: boolean };
	trustedOrigins: string[];
}

export default function SecurityPolicyPage() {
	const { data } = useQuery({
		queryKey: ["settings", "security"],
		queryFn: async () => {
			const r = await fetch("/api/admin/settings/security");
			const d = (await r.json()) as { ok?: boolean; data?: SecurityPolicy };
			return d.ok ? d.data ?? null : null;
		},
	});

	const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
	const [originInput, setOriginInput] = useState("");

	useEffect(() => {
		if (data) setPolicy(data);
	}, [data]);

	if (!policy) {
		return <div className="text-muted">加载中…</div>;
	}

	const addOrigin = () => {
		if (!originInput) return;
		setPolicy({
			...policy,
			trustedOrigins: [...policy.trustedOrigins, originInput],
		});
		setOriginInput("");
	};

	return (
		<div className="max-w-2xl">
			<h1 className="mb-4 font-serif text-xl text-gold-500">安全策略</h1>
			<div className="space-y-5 rounded-lg border border-ink-700 bg-ink-900 p-6">
				<Row label="OTP 过期时长">
					<input
						value={policy.otpTtl}
						onChange={(e) => setPolicy({ ...policy, otpTtl: e.target.value })}
						className="rounded border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm"
					/>
				</Row>
				<Row label="每日 OTP 上限">
					<input
						type="number"
						value={policy.otpDailyMax}
						onChange={(e) =>
							setPolicy({ ...policy, otpDailyMax: Number(e.target.value) })
						}
						className="rounded border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm"
					/>
				</Row>
				<Row label="密码错误锁定阈值">
					<input
						type="number"
						value={policy.lockoutThreshold}
						onChange={(e) =>
							setPolicy({ ...policy, lockoutThreshold: Number(e.target.value) })
						}
						className="rounded border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm"
					/>
				</Row>
				<Row label="强制 2FA">
					<div className="flex gap-4 text-sm">
						{(["cinacoin", "cinatoken"] as const).map((site) => (
							<label key={site} className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={policy.force2fa[site]}
									onChange={(e) =>
										setPolicy({
											...policy,
											force2fa: { ...policy.force2fa, [site]: e.target.checked },
										})
									}
								/>
								{site}
							</label>
						))}
					</div>
				</Row>
				<div>
					<div className="mb-1 text-sm text-muted">可信域名</div>
					<div className="mb-2 flex gap-2">
						<input
							value={originInput}
							onChange={(e) => setOriginInput(e.target.value)}
							placeholder="https://cinacoin.cinagroup.com"
							className="flex-1 rounded border border-ink-700 bg-ink-800 px-3 py-1.5 text-sm"
						/>
						<button
							type="button"
							onClick={addOrigin}
							className="rounded border border-ink-700 px-3 py-1.5 text-sm"
						>
							添加
						</button>
					</div>
					<ul className="space-y-1 text-sm">
						{policy.trustedOrigins.map((o, i) => (
							<li key={`${o}-${i}`} className="font-mono text-xs text-muted">
								{o}
							</li>
						))}
					</ul>
				</div>
			</div>
			<p className="mt-3 text-xs text-muted">
				注：v1 安全参数为只读展示；变更需在 auth.cinagroup.com 配置文件应用（写入端点待后续开放）。
			</p>
		</div>
	);
}

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</div>
	);
}
