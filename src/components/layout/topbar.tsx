"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Monitor, Moon, Sun } from "lucide-react";
import type { AdminSession } from "@/lib/cinaauth/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Topbar() {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();
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
			<div className="flex items-center gap-2">
				{/* Theme switcher */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="Toggle theme">
							<Sun size={16} className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
							<Moon size={16} className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setTheme("light")}>
							<Sun size={14} /> 浅色
							{theme === "light" && <span className="ml-auto text-accent">✓</span>}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>
							<Moon size={14} /> 暗色
							{theme === "dark" && <span className="ml-auto text-accent">✓</span>}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>
							<Monitor size={14} /> 跟随系统
							{theme === "system" && (
								<span className="ml-auto text-accent">✓</span>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

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
