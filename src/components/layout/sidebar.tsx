"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
	LayoutDashboard,
	Users,
	MonitorSmartphone,
	Building2,
	KeyRound,
	ShieldCheck,
	ScrollText,
	Shield,
	type LucideIcon,
} from "lucide-react";

interface NavItem {
	href: string;
	key: string;
	icon: LucideIcon;
}
interface NavSection {
	groupKey: string | null;
	items: NavItem[];
}

const NAV: NavSection[] = [
	{
		groupKey: null,
		items: [{ href: "/dashboard", key: "nav.overview", icon: LayoutDashboard }],
	},
	{
		groupKey: "nav.accounts",
		items: [
			{ href: "/users", key: "nav.users", icon: Users },
			{ href: "/sessions", key: "nav.sessions", icon: MonitorSmartphone },
			{ href: "/organizations", key: "nav.organizations", icon: Building2 },
			{ href: "/api-keys", key: "nav.apiKeys", icon: KeyRound },
		],
	},
	{
		groupKey: "nav.compliance",
		items: [
			{ href: "/audit", key: "nav.auditLog", icon: ScrollText },
			{ href: "/settings/security", key: "nav.securityPolicy", icon: ShieldCheck },
		],
	},
];

export function Sidebar() {
	const { t } = useTranslation();
	const pathname = usePathname();
	return (
		<aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas">
			<div className="flex items-center gap-2 border-b border-hairline px-4 py-5">
				<div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-canvas">
					<Shield size={16} strokeWidth={2.25} />
				</div>
				<div className="flex flex-col leading-tight">
					<span className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
						CinaGroup
					</span>
					<span className="text-[11px] leading-3 text-mute">
						{t("instance.production")}
					</span>
				</div>
			</div>
			<nav className="flex-1 space-y-4 px-2 py-3">
				{NAV.map((section) => (
					<div key={section.groupKey ?? "top"}>
						{section.groupKey && (
							<div className="mb-1 px-2 font-mono text-[11px] uppercase tracking-wide text-mute">
								{t(section.groupKey)}
							</div>
						)}
						{section.items.map((item) => {
							const active =
								pathname === item.href ||
								pathname.startsWith(`${item.href}/`);
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2.5 rounded-[var(--radius-sm)] border-l-2 px-3 py-2 text-[14px] leading-5 transition-colors ${
										active
											? "border-accent bg-canvas-soft-2 font-medium text-ink"
											: "border-transparent text-body hover:bg-canvas-soft hover:text-ink"
									}`}
								>
									<Icon
										size={16}
										strokeWidth={active ? 2.25 : 2}
										className={active ? "text-accent" : "text-mute"}
									/>
									{t(item.key)}
								</Link>
							);
						})}
					</div>
				))}
			</nav>
		</aside>
	);
}
