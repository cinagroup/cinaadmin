"use client";

import { useState } from "react";
import { OverviewTab } from "./tabs/overview";
import { WalletsTab } from "./tabs/wallets";
import { SessionsTab } from "./tabs/sessions";
import { LoginTrailTab } from "./tabs/login-trail";

const TABS = [
	"overview",
	"wallets",
	"third-party",
	"sessions",
	"login-trail",
	"security",
] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
	overview: "概览",
	wallets: "钱包 (SIWE)",
	"third-party": "第三方绑定",
	sessions: "会话",
	"login-trail": "登录轨迹",
	security: "安全",
};

export function UserTabs({ userId }: { userId: string }) {
	const [tab, setTab] = useState<Tab>("overview");
	return (
		<div className="mt-4">
			<div className="flex gap-1 border-b border-ink-700">
				{TABS.map((t) => (
					<button
						type="button"
						key={t}
						onClick={() => setTab(t)}
						className={`px-4 py-2 text-sm ${
							tab === t
								? "border-b-2 border-gold-500 text-gold-400"
								: "text-muted"
						}`}
					>
						{TAB_LABELS[t]}
					</button>
				))}
			</div>
			<div className="mt-4">
				{tab === "overview" && <OverviewTab userId={userId} />}
				{tab === "wallets" && <WalletsTab userId={userId} />}
				{tab === "third-party" && (
					<div className="text-muted">第三方绑定（OAuth 记录）</div>
				)}
				{tab === "sessions" && <SessionsTab userId={userId} />}
				{tab === "login-trail" && <LoginTrailTab userId={userId} />}
				{tab === "security" && (
					<div className="text-muted">安全详情（Phase 3 扩展）</div>
				)}
			</div>
		</div>
	);
}
