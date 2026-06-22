"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/layout/page-header";

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
		return (
			<div>
				<PageHeader title="安全策略" />
				<p className="text-[16px] leading-6 text-body">加载中…</p>
			</div>
		);
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
			<PageHeader title="安全策略" />
			<Card>
				<CardContent className="space-y-5">
					<Row label="OTP 过期时长">
						<Input
							value={policy.otpTtl}
							onChange={(e) => setPolicy({ ...policy, otpTtl: e.target.value })}
							className="w-40"
						/>
					</Row>
					<Row label="每日 OTP 上限">
						<Input
							type="number"
							value={policy.otpDailyMax}
							onChange={(e) =>
								setPolicy({ ...policy, otpDailyMax: Number(e.target.value) })
							}
							className="w-40"
						/>
					</Row>
					<Row label="密码错误锁定阈值">
						<Input
							type="number"
							value={policy.lockoutThreshold}
							onChange={(e) =>
								setPolicy({ ...policy, lockoutThreshold: Number(e.target.value) })
							}
							className="w-40"
						/>
					</Row>
					<Row label="强制 2FA">
						<div className="flex gap-4">
							{(["cinacoin", "cinatoken"] as const).map((site) => (
								<label
									key={site}
									className="flex items-center gap-2 text-[14px] leading-5 text-body"
								>
									<Checkbox
										checked={policy.force2fa[site]}
										onCheckedChange={(v) =>
											setPolicy({
												...policy,
												force2fa: {
													...policy.force2fa,
													[site]: v === true,
												},
											})
										}
									/>
									{site}
								</label>
							))}
						</div>
					</Row>
					<div>
						<div className="mb-1 text-[14px] leading-5 text-body">可信域名</div>
						<div className="mb-2 flex gap-2">
							<Input
								value={originInput}
								onChange={(e) => setOriginInput(e.target.value)}
								placeholder="https://cinacoin.cinagroup.com"
								className="flex-1"
							/>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={addOrigin}
							>
								添加
							</Button>
						</div>
						<ul className="space-y-1">
							{policy.trustedOrigins.map((o, i) => (
								<li
									key={`${o}-${i}`}
									className="font-mono text-[12px] leading-4 text-mute"
								>
									{o}
								</li>
							))}
						</ul>
					</div>
				</CardContent>
			</Card>
			<p className="mt-3 text-[12px] leading-4 text-mute">
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
			<span className="text-[14px] leading-5 text-body">{label}</span>
			{children}
		</div>
	);
}
