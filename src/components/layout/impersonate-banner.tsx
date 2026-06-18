"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminSession } from "@/lib/cinaauth/types";

/**
 * Persistent, non-dismissible banner shown while an admin is impersonating a
 * user. Phase 1: detection only (Stop button wired in Phase 3 with the
 * stop-impersonate proxy).
 */
export function ImpersonateBanner() {
	const { t } = useTranslation();
	const [acting, setActing] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/admin/session")
			.then((r) => r.json())
			.then((d: { ok?: boolean; data?: AdminSession }) => {
				if (d.ok && d.data?.impersonatedBy) {
					setActing(d.data.email ?? d.data.userId);
				}
			})
			.catch(() => {
				/* ignore */
			});
	}, []);

	if (!acting) return null;
	return (
		<div className="flex items-center justify-between border-b border-gold-500/40 bg-gold-500/15 px-6 py-2 text-sm text-gold-400">
			<span>{t("impersonate.banner", { user: acting })}</span>
			<button type="button" className="underline">
				{t("impersonate.stop")}
			</button>
		</div>
	);
}
