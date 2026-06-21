import { cookies } from "next/headers";
import { StatCard } from "@/components/charts/stat-card";
import { ChannelPie } from "@/components/charts/channel-pie";
import { SignupLine } from "@/components/charts/signup-line";
import {
	statsOverview,
	statsSecurityToday,
	statsSignups,
} from "@/lib/cinaauth/admin-api";

// Stats are aggregations; tolerate a short revalidate window.
export const revalidate = 45;

export default async function DashboardPage() {
	const cookie = (await cookies()).toString();
	const [overview, signups, security] = await Promise.all([
		statsOverview(cookie).catch(() => null),
		statsSignups(cookie, "30d").catch(() => []),
		statsSecurityToday(cookie).catch(() => null),
	]);

	if (!overview) {
		return <div className="text-muted">数据加载失败</div>;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard label="总用户" value={overview.totalUsers} />
				<StatCard label="30 天新增" value={overview.newUsers30d} />
				<StatCard label="活跃会话" value={overview.activeSessions} />
				<StatCard label="组织数" value={overview.organizationCount} />
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
					<div className="mb-2 text-sm text-muted">登录渠道分布</div>
					<ChannelPie channels={overview.loginChannels} />
				</div>
				<div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
					<div className="mb-2 text-sm text-muted">30 天注册趋势</div>
					<SignupLine data={signups} />
				</div>
			</div>
			<div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
				<div className="mb-3 text-sm text-muted">安全看板</div>
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
			</div>
		</div>
	);
}
