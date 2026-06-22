"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

interface NavItem {
	href: string;
	key: string;
}
interface NavSection {
	groupKey: string | null;
	items: NavItem[];
}

const NAV: NavSection[] = [
	{ groupKey: null, items: [{ href: "/dashboard", key: "nav.overview" }] },
	{
		groupKey: "nav.accounts",
		items: [
			{ href: "/users", key: "nav.users" },
			{ href: "/sessions", key: "nav.sessions" },
			{ href: "/organizations", key: "nav.organizations" },
			{ href: "/api-keys", key: "nav.apiKeys" },
		],
	},
	{
		groupKey: "nav.compliance",
		items: [
			{ href: "/audit", key: "nav.auditLog" },
			{ href: "/settings/security", key: "nav.securityPolicy" },
		],
	},
];

export function Sidebar() {
	const { t } = useTranslation();
	const pathname = usePathname();
	return (
		<aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas">
			<div className="flex items-center gap-2 border-b border-hairline px-4 py-5">
				<span className="text-[16px] font-semibold leading-6 tracking-[-0.32px] text-ink">
					CinaGroup
				</span>
				<span className="rounded-full bg-canvas-soft px-2 text-[12px] leading-4 text-body">
					{t("instance.production")}
				</span>
			</div>
			<nav className="flex-1 space-y-4 px-2 py-3">
				{NAV.map((section) => (
					<div key={section.groupKey ?? "top"}>
						{section.groupKey && (
							<div className="mb-1 px-2 font-mono text-[12px] uppercase tracking-wide text-mute">
								{t(section.groupKey)}
							</div>
						)}
						{section.items.map((item) => {
							const active =
								pathname === item.href ||
								pathname.startsWith(`${item.href}/`);
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`block rounded-[var(--radius-sm)] px-3 py-2 text-[14px] leading-5 transition-colors ${
										active
											? "bg-canvas-soft-2 font-medium text-ink"
											: "text-body hover:bg-canvas-soft hover:text-ink"
									}`}
								>
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
