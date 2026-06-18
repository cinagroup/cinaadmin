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
		<aside className="w-60 shrink-0 flex flex-col border-r border-ink-700 bg-ink-900">
			<div className="flex items-center gap-2 border-b border-ink-700 px-4 py-5">
				<span className="font-serif text-lg text-gold-500">CinaGroup</span>
				<span className="rounded border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-xs text-gold-400">
					{t("instance.production")}
				</span>
			</div>
			<nav className="flex-1 space-y-4 px-2 py-3">
				{NAV.map((section) => (
					<div key={section.groupKey ?? "top"}>
						{section.groupKey && (
							<div className="mb-1 px-2 text-xs uppercase tracking-wide text-muted">
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
									className={`block rounded px-3 py-2 text-sm transition ${
										active
											? "bg-gold-500/10 text-gold-400"
											: "text-text hover:bg-ink-800"
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
