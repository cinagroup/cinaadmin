"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminSession } from "@/lib/cinaauth/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function Topbar() {
	const { t, i18n } = useTranslation();
	const [session, setSession] = useState<AdminSession | null>(null);
	const lang = i18n.language?.startsWith("zh") ? "zh" : "en";

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
		<header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
			<div className="text-[14px] leading-5 text-body">
				{session?.email ?? ""}
			</div>
			<div className="flex items-center gap-3">
				<Select
					value={lang}
					onValueChange={(v) => i18n.changeLanguage(v)}
				>
					<SelectTrigger className="h-8 w-[88px] text-[14px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">EN</SelectItem>
						<SelectItem value="zh">中文</SelectItem>
					</SelectContent>
				</Select>
				<button
					type="button"
					onClick={() => {
						window.location.href = `${process.env.NEXT_PUBLIC_CINAUTH_AUTH_URL ?? ""}/sign-out`;
					}}
					className="text-[14px] leading-5 text-body transition-colors hover:text-ink"
				>
					{t("common.signOut")}
				</button>
			</div>
		</header>
	);
}
