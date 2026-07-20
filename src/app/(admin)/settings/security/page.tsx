"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";

interface SecurityPolicy {
	otpTtl: string;
	otpDailyMax: number;
	lockoutThreshold: number;
	banDuration: string;
	force2fa: { cinacoin: boolean; cinatoken: boolean };
	trustedOrigins: string[];
}

export default function SecurityPolicyPage() {
	const { t } = useI18n();
	const { data } = useQuery({
		queryKey: ["settings", "security"],
		queryFn: async () => {
			const r = await fetch("/api/admin/settings/security");
			const d = (await r.json()) as { ok?: boolean; data?: SecurityPolicy };
			return d.ok ? d.data ?? null : null;
		},
	});

	const [policy, setPolicy] = useState<SecurityPolicy | null>(null);

	useEffect(() => {
		if (data) setPolicy(data);
	}, [data]);

	if (!policy) {
		return (
			<div>
				<PageHeader title={t("security.title")}><Badge variant="muted">{t("security.readOnly")}</Badge></PageHeader>
				<p className="text-[16px] leading-6 text-body">{t("common.loading")}</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl">
			<PageHeader title={t("security.title")}><Badge variant="muted">{t("security.readOnly")}</Badge></PageHeader>
			{/* Read-only until Phase 2 wires up a persistence endpoint. The
			    controls below are disabled so the UI never implies an edit will
			    save when there is nowhere to save it. */}
			<Card>
				<CardContent className="space-y-5">
					<Row label={t("security.otpExpiry")}>
						<Input value={policy.otpTtl} readOnly disabled className="w-40" />
					</Row>
					<Row label={t("security.otpDailyLimit")}>
						<Input type="number" value={policy.otpDailyMax} readOnly disabled className="w-40" />
					</Row>
					<Row label={t("security.passwordLockout")}>
						<Input type="number" value={policy.lockoutThreshold} readOnly disabled className="w-40" />
					</Row>
					<Row label={t("security.force2fa")}>
						<div className="flex gap-4">
							{(["cinacoin", "cinatoken"] as const).map((site) => (
								<label
									key={site}
									className="flex items-center gap-2 text-[14px] leading-5 text-body"
								>
									<Checkbox checked={policy.force2fa[site]} disabled />
									{site}
								</label>
							))}
						</div>
					</Row>
					<div>
						<div className="mb-1 text-[14px] leading-5 text-body">{t("security.trustedDomains")}</div>
						{policy.trustedOrigins.length > 0 ? (
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
						) : (
							<p className="text-[12px] leading-4 text-mute">{t("common.noData")}</p>
						)}
					</div>
				</CardContent>
			</Card>
			<p className="mt-3 text-[12px] leading-4 text-mute">
				{t("placeholder.phase2")}
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
