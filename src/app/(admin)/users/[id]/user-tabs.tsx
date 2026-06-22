"use client";

import { OverviewTab } from "./tabs/overview";
import { WalletsTab } from "./tabs/wallets";
import { SessionsTab } from "./tabs/sessions";
import { LoginTrailTab } from "./tabs/login-trail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
	{ value: "overview", label: "概览" },
	{ value: "wallets", label: "钱包 (SIWE)" },
	{ value: "third-party", label: "第三方绑定" },
	{ value: "sessions", label: "会话" },
	{ value: "login-trail", label: "登录轨迹" },
	{ value: "security", label: "安全" },
] as const;

export function UserTabs({ userId }: { userId: string }) {
	return (
		<Tabs defaultValue="overview" className="mt-6">
			<TabsList>
				{TABS.map((t) => (
					<TabsTrigger key={t.value} value={t.value}>
						{t.label}
					</TabsTrigger>
				))}
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab userId={userId} />
			</TabsContent>
			<TabsContent value="wallets">
				<WalletsTab userId={userId} />
			</TabsContent>
			<TabsContent value="third-party">
				<p className="text-[14px] leading-5 text-body">第三方绑定（OAuth 记录）</p>
			</TabsContent>
			<TabsContent value="sessions">
				<SessionsTab userId={userId} />
			</TabsContent>
			<TabsContent value="login-trail">
				<LoginTrailTab userId={userId} />
			</TabsContent>
			<TabsContent value="security">
				<p className="text-[14px] leading-5 text-body">安全详情（Phase 3 扩展）</p>
			</TabsContent>
		</Tabs>
	);
}
