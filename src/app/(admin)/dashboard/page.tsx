import { cookies } from "next/headers";
import { StatCard } from "@/components/charts/stat-card";
import { ChannelPie } from "@/components/charts/channel-pie";
import { SignupLine } from "@/components/charts/signup-line";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import {
	statsOverview,
	statsSecurityToday,
	statsSignups,
} from "@/lib/cinaauth/admin-api";

// Force dynamic rendering (uses cookies()); edge runtime required by
// Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const cookie = (await cookies()).toString();
	const [overview, signups, security] = await Promise.all([
		statsOverview(cookie).catch(() => null),
		statsSignups(cookie, "30d").catch(() => []),
		statsSecurityToday(cookie).catch(() => null),
	]);

	if (!overview) {
		return (
			<div>
				<PageHeader title="仪表盘" />
				<p className="text-[16px] leading-6 text-body">数据加载失败</p>
			</div>
		);
	}

	return (
		<div>
			<PageHeader title="仪表盘" />
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<StatCard label="总用户" value={overview.totalUsers} />
					<StatCard label="30 天新增" value={overview.newUsers30d} />
					<StatCard label="活跃会话" value={overview.activeSessions} />
					<StatCard label="组织数" value={overview.organizationCount} />
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">登录渠道分布</div>
						</CardHeader>
						<CardContent>
							<ChannelPie channels={overview.loginChannels} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">30 天注册趋势</div>
						</CardHeader>
						<CardContent>
							<SignupLine data={signups} />
						</CardContent>
					</Card>
				</div>
				<Card>
					<CardHeader>
						<div className="text-[14px] leading-5 text-body">安全看板</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							<StatCard
								label="今日失败登录"
								value={security?.failedLoginsToday ?? 0}
							/>
							<StatCard
								label="今日 OTP 请求"
								value={security?.otpRequestsToday ?? 0}
							/>
							<StatCard label="封禁账号" value={overview.bannedCount} />
							<StatCard
								label="未开 2FA"
								value={overview.usersWithout2FA}
								hint="高危资金账号"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
