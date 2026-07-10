"use client";

import { OverviewTab } from "./tabs/overview";
import { WalletsTab } from "./tabs/wallets";
import { SessionsTab } from "./tabs/sessions";
import { LoginTrailTab } from "./tabs/login-trail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { UserDTO } from "@/lib/cinaauth/dto";

export function UserTabs({ user }: { user: UserDTO }) {
	const { t } = useI18n();
	const userId = user.id;
	const TABS = [
		{ value: "overview", label: t("userDetail.tab.overview") },
		{ value: "wallets", label: t("userDetail.tab.wallets") },
		{ value: "third-party", label: t("userDetail.tab.wallets") },
		{ value: "sessions", label: t("userDetail.tab.sessions") },
		{ value: "login-trail", label: t("userDetail.tab.loginTrail") },
		{ value: "security", label: t("userDetail.tab.security") },
	] as const;

	return (
		<Tabs defaultValue="overview">
			<TabsList>
				{TABS.map((tab) => (
					<TabsTrigger key={tab.value} value={tab.value}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab user={user} />
			</TabsContent>
			<TabsContent value="wallets">
				<WalletsTab userId={userId} />
			</TabsContent>
			<TabsContent value="third-party">
				<p className="text-[14px] leading-5 text-body">{t("placeholder.phase2")}</p>
			</TabsContent>
			<TabsContent value="sessions">
				<SessionsTab userId={userId} />
			</TabsContent>
			<TabsContent value="login-trail">
				<LoginTrailTab userId={userId} />
			</TabsContent>
			<TabsContent value="security">
				<p className="text-[14px] leading-5 text-body">{t("placeholder.phase2")}</p>
			</TabsContent>
		</Tabs>
	);
}
