"use client";

import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAdminSession } from "@/hooks/use-admin-session";
import { LogOut, Monitor, Moon, Sun, User } from "lucide-react";
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Topbar() {
	const { t, lang, setLang } = useI18n();
	const { theme, setTheme } = useTheme();
	// Shared React Query hook — dedupes with RoleGuard / ImpersonateBanner so
	// the console makes a single /api/admin/session request per load, not three.
	const { data: session } = useAdminSession();

	const initials = (session?.email ?? "?")
		.split("@")[0]
		.slice(0, 2)
		.toUpperCase();

	return (
		<header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
			<div className="text-[14px] leading-5 text-body">
				{/* Breadcrumb-style context: subtle, fills the left space. */}
			</div>
			<div className="flex items-center gap-2">
				{/* Theme switcher */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label={t("theme.toggle")}>
							<Sun size={16} className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
							<Moon size={16} className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setTheme("light")}>
							<Sun size={14} /> {t("theme.light")}
							{theme === "light" && <span className="ml-auto text-link">✓</span>}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>
							<Moon size={14} /> {t("theme.dark")}
							{theme === "dark" && <span className="ml-auto text-link">✓</span>}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>
							<Monitor size={14} /> {t("theme.system")}
							{theme === "system" && (
								<span className="ml-auto text-link">✓</span>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Select
					value={lang}
					onValueChange={(v) => setLang(v as "zh" | "en")}
				>
					<SelectTrigger className="h-8 w-[88px] text-[14px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">EN</SelectItem>
						<SelectItem value="zh">中文</SelectItem>
					</SelectContent>
				</Select>

				{/* Account menu — avatar + email + sign out (BAC pattern). */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-2 rounded-[var(--radius-pill)] py-1 pl-1 pr-2 transition-colors hover:bg-canvas-soft"
						>
							<span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas-soft-2 text-[12px] font-semibold text-ink">
								{initials}
							</span>
							<span className="hidden text-[13px] leading-4 text-body sm:inline">
								{session?.email ?? ""}
							</span>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="min-w-[200px]">
						<DropdownMenuLabel className="flex items-center gap-2 text-[13px] text-mute">
							<User size={14} />
							{session?.email ?? ""}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								window.location.href = `${process.env.NEXT_PUBLIC_CINAUTH_AUTH_URL ?? ""}/sign-out`;
							}}
							className="text-error"
						>
							<LogOut size={14} />
							{t("common.signOut")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
