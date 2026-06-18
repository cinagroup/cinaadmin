"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminSession } from "@/lib/cinaauth/types";

export function Topbar() {
	const { t, i18n } = useTranslation();
	const [session, setSession] = useState<AdminSession | null>(null);

	useEffect(() => {
		fetch("/api/admin/session")
			.then((r) => r.json())
			.then((d: { ok?: boolean; data?: AdminSession }) => {
				if (d.ok && d.data) setSession(d.data);
			})
			.catch(() => {
				/* ignore — handled by middleware redirect */
			});
	}, []);

	return (
		<header className="flex h-14 items-center justify-between border-b border-ink-700 bg-ink-900 px-6">
			<div className="text-sm text-muted">{session?.email ?? ""}</div>
			<div className="flex items-center gap-3">
				<select
					value={i18n.language?.startsWith("zh") ? "zh" : "en"}
					onChange={(e) => i18n.changeLanguage(e.target.value)}
					className="rounded border border-ink-700 bg-ink-800 px-2 py-1 text-sm"
				>
					<option value="en">EN</option>
					<option value="zh">中文</option>
				</select>
				<button
					type="button"
				onClick={() => {
					window.location.href = `${process.env.NEXT_PUBLIC_CINAUTH_BASE_URL ?? ""}/sign-out`;
				}}
					className="text-sm text-muted hover:text-text"
				>
					{t("common.signOut")}
				</button>
			</div>
		</header>
	);
}
