import { cookies } from "next/headers";
import { StatCard } from "@/components/charts/stat-card";
import { ChannelPie } from "@/components/charts/channel-pie";
import { SignupLine } from "@/components/charts/signup-line";
import { ActiveUsersChart } from "@/components/charts/active-users-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
	statsOverview,
	statsSecurityToday,
	statsSignups,
} from "@/lib/cinaauth/admin-api";
import type { SignupPointDTO } from "@/lib/cinaauth/dto";

// Force dynamic rendering (uses cookies()); edge runtime required by
// Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Sum counts in `series` whose date falls within the last `days` days. */
function sumLastDays(series: SignupPointDTO[], days: number): number {
	const cutoff = new Date();
	cutoff.setHours(0, 0, 0, 0);
	cutoff.setDate(cutoff.getDate() - days);
	return series
		.filter((p) => new Date(p.date) >= cutoff)
		.reduce((a, p) => a + p.count, 0);
}

/** Percent change of `cur` vs `prev`. Returns null when prev is 0 (undefined). */
function pctChange(cur: number, prev: number): number | null {
	if (prev === 0) return cur === 0 ? 0 : null;
	return ((cur - prev) / prev) * 100;
}

function todayLabel() {
	const d = new Date();
	const m = d.toLocaleString("en-US", { month: "short" });
	return `${m} ${d.getDate()}`;
}

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

	// Derive deltas from the 30d signup series: compare last 7d vs prior 7d.
	const signups7d = sumLastDays(signups, 7);
	const signupsPrev7d =
		sumLastDays(signups, 14) - signups7d;
	const signupsDelta = pctChange(signups7d, signupsPrev7d);
	const sparkSignups = signups.slice(-14).map((p) => p.count);

	return (
		<div>
			<PageHeader title="仪表盘" />
			<div className="space-y-6">
				{/* BAC-style context bar */}
				<div className="flex flex-wrap items-center gap-2 text-[12px] leading-4 text-mute">
					<span className="font-mono uppercase tracking-wide">
						数据快照 · {todayLabel()}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<StatCard
						label="总用户"
						value={overview.totalUsers}
						spark={sparkSignups}
					/>
					<StatCard
						label="30 天新增"
						value={overview.newUsers30d}
						delta={signupsDelta ?? undefined}
						deltaLabel="vs 上周"
						spark={sparkSignups}
					/>
					<StatCard label="活跃会话" value={overview.activeSessions} />
					<StatCard label="组织数" value={overview.organizationCount} />
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">
								活跃用户趋势（近 14 天）
							</div>
							<div className="text-[12px] leading-4 text-mute">
								基于登录事件派生
							</div>
						</CardHeader>
						<CardContent>
							<ActiveUsersChart days={14} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">
								30 天注册趋势
							</div>
						</CardHeader>
						<CardContent>
							<SignupLine data={signups} />
						</CardContent>
					</Card>
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">
								登录渠道分布
							</div>
						</CardHeader>
						<CardContent>
							<ChannelPie channels={overview.loginChannels} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">安全看板</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
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
				{/* Retention placeholder — requires a backend cohort endpoint. */}
				<EmptyState>
					<div className="font-mono text-[12px] uppercase tracking-wide text-mute">
						留存分析
					</div>
					<div className="text-[14px] leading-5 text-body">
						次日 / 7 日留存趋势需后端数据端点（规划中）
					</div>
				</EmptyState>
			</div>
		</div>
	);
}
