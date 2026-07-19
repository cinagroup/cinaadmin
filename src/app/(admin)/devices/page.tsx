"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
export default function DevicesPage() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [userCode, setUserCode] = useState("");
	const [device, setDevice] = useState<Record<string, unknown> | null>(null);
	const lookup = async () => {
		const r = await fetch(`/api/admin/device/approve`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userCode, action: "lookup" }) });
		const d = await r.json().catch(() => null);
		setDevice(d?.ok ? d.data : null);
	};
	const act = async (action: "approve" | "deny") => {
		const r = await fetch(`/api/admin/device/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userCode }) });
		if (r.ok) { toast.success(action === "approve" ? t("devices.approve") : t("devices.deny")); setDevice(null); setUserCode(""); }
	};
	return (
		<div className="max-w-md">
			<PageHeader title={t("devices.title")} />
			<div className="space-y-4">
				<div className="space-y-1.5">
					<Label>{t("devices.userCode")}</Label>
					<div className="flex gap-2"><Input value={userCode} onChange={(e) => setUserCode(e.target.value)} className="font-mono" /><Button variant="secondary" size="sm" onClick={lookup}>Lookup</Button></div>
				</div>
				{device && (
					<div className="rounded-[var(--radius-md)] border border-hairline bg-canvas p-4">
						<pre className="mb-3 text-[13px] text-body">{JSON.stringify(device, null, 2)}</pre>
						<div className="flex gap-2">
							<Button variant="primary" size="sm" onClick={() => act("approve")}>{t("devices.approve")}</Button>
							<Button variant="danger" size="sm" onClick={() => act("deny")}>{t("devices.deny")}</Button>
						</div>
					</div>
				)}
				{!device && <p className="text-[14px] text-mute">{t("devices.empty")}</p>}
			</div>
		</div>
	);
}
