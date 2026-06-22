"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminSession } from "@/lib/cinaauth/types";

/**
 * Persistent, non-dismissible banner shown while an admin is impersonating a
 * user. Stop button calls /api/admin/users/impersonate/stop then reloads.
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
		<div className="flex items-center justify-between border-b border-[#ab570a]/40 bg-[var(--color-warning-soft)] px-6 py-2 text-[14px] leading-5 text-[#ab570a]">
			<span>{t("impersonate.banner", { user: acting })}</span>
			<button
				type="button"
				className="underline underline-offset-4"
				onClick={async () => {
					await fetch("/api/admin/users/impersonate/stop", {
						method: "POST",
					});
					window.location.reload();
				}}
			>
				{t("impersonate.stop")}
			</button>
		</div>
	);
}
