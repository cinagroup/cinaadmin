"use client";

import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/charts/stat-card";
import { ChannelPie } from "@/components/charts/channel-pie";
import { CohortBars } from "@/components/charts/cohort-bars";
import { SignupLine } from "@/components/charts/signup-line";
import { ActiveUsersChart } from "@/components/charts/active-users-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { useI18n } from "@/lib/i18n/i18n-context";
import type {
	SignupPointDTO,
	StatsOverviewDTO,
	SecurityTodayDTO,
} from "@/lib/cinaauth/dto";

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

const EMPTY_OVERVIEW: StatsOverviewDTO = {
	totalUsers: 0,
	newUsers30d: 0,
	activeSessions: 0,
	organizationCount: 0,
	bannedCount: 0,
	usersWithout2FA: 0,
	loginChannels: {},
};
const EMPTY_SECURITY: SecurityTodayDTO = {
	failedLoginsToday: 0,
	otpRequestsToday: 0,
	geoAnomalyCount: 0,
};

export default function DashboardPage() {
	const { t } = useI18n();
	// Client-side data fetching — the shell renders instantly (no SSR await on
	// cinaauth), so navigation to /dashboard is as fast as the other pages.
	// Each query is independent and caches in React Query.
	const { data: overview, isLoading: ovLoading } = useQuery({
		queryKey: ["stats-overview"],
		queryFn: async () => {
			const r = await fetch("/api/admin/stats/overview");
			const d = (await r.json()) as {
				ok?: boolean;
				data?: StatsOverviewDTO;
			};
			return d.ok ? d.data ?? EMPTY_OVERVIEW : EMPTY_OVERVIEW;
		},
		staleTime: 60_000,
	});
	const { data: signups } = useQuery<SignupPointDTO[]>({
		queryKey: ["stats-signups", "30d"],
		queryFn: async () => {
			const r = await fetch("/api/admin/stats/signups?range=30d");
			const d = (await r.json()) as {
				ok?: boolean;
				data?: { data?: SignupPointDTO[] };
			};
			return d.ok ? d.data?.data ?? [] : [];
		},
		staleTime: 60_000,
	});
	const { data: security } = useQuery({
		queryKey: ["stats-security"],
		queryFn: async () => {
			const r = await fetch("/api/admin/stats/security-today");
			const d = (await r.json()) as {
				ok?: boolean;
				data?: SecurityTodayDTO;
			};
			return d.ok ? d.data ?? EMPTY_SECURITY : EMPTY_SECURITY;
		},
		staleTime: 60_000,
	});

	const ov = overview ?? EMPTY_OVERVIEW;
	const sec = security ?? EMPTY_SECURITY;
	const signupSeries = signups ?? [];

	// Derive deltas from the 30d signup series: compare last 7d vs prior 7d.
	const signups7d = sumLastDays(signupSeries, 7);
	const signupsPrev7d = sumLastDays(signupSeries, 14) - signups7d;
	const signupsDelta = pctChange(signups7d, signupsPrev7d);
	const sparkSignups = signupSeries.slice(-14).map((p) => p.count);

	/** Skeleton placeholder matching the StatCard shape. */
	const StatSkeleton = () => (
		<div className="flex items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-hairline bg-canvas p-5 shadow-card">
			<div className="w-full space-y-2">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-7 w-16" />
			</div>
		</div>
	);

	return (
		<div className="space-y-8">
			<PageHeader
				title={t("dashboard.title")}
				description={`${t("dashboard.snapshot")} · ${todayLabel()}`}
			/>

			{/* Users section */}
			<Section label={t("dashboard.section.users")}>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{ovLoading ? (
						<StatSkeleton />
					) : (
						<StatCard
							label={t("dashboard.totalUsers")}
							value={ov.totalUsers}
							spark={sparkSignups}
						/>
					)}
					{ovLoading ? (
						<StatSkeleton />
					) : (
						<StatCard
							label={t("dashboard.activeUsers")}
							value={ov.activeSessions}
							deltaLabel={`on ${todayLabel()}`}
						/>
					)}
					{ovLoading ? (
						<StatSkeleton />
					) : (
						<StatCard
							label={t("dashboard.newUsers30d")}
							value={ov.newUsers30d}
							delta={signupsDelta ?? undefined}
							deltaLabel={t("dashboard.vsLastWeek")}
							spark={sparkSignups}
						/>
					)}
					{ovLoading ? (
						<StatSkeleton />
					) : (
						<StatCard label={t("dashboard.bannedCount")} value={ov.bannedCount} />
					)}
				</div>
			</Section>

			{/* User activity section — signature cohort chart */}
			<Section label={t("dashboard.section.activity")}>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">
								{t("dashboard.cohort.title")}
							</div>
							<div className="flex items-center gap-4 text-[12px] leading-4 text-mute">
								<span className="inline-flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-[2px] bg-chart-1" />
									{t("dashboard.cohort.new")}
								</span>
								<span className="inline-flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-[2px] bg-chart-2" />
									{t("dashboard.cohort.returning")}
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<CohortBars days={14} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className="text-[14px] leading-5 text-body">
								{t("dashboard.activeTrend.title")}
							</div>
							<div className="text-[12px] leading-4 text-mute">
								{t("dashboard.activeTrend.hint")}
							</div>
						</CardHeader>
						<CardContent>
							<ActiveUsersChart days={14} />
						</CardContent>
				</Card>
			</div>
		</Section>

		{/* Organizations + security section */}
		<Section label={t("dashboard.section.orgSecurity")}>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard label={t("dashboard.orgCount")} value={ov.organizationCount} />
				<StatCard
					label={t("dashboard.no2fa")}
					value={ov.usersWithout2FA}
					hint={t("dashboard.no2fa.hint")}
				/>
				<StatCard
					label={t("dashboard.failedLogins")}
					value={sec.failedLoginsToday}
				/>
				<StatCard
					label={t("dashboard.otpRequests")}
					value={sec.otpRequestsToday}
				/>
			</div>
		</Section>

		<Section label={t("dashboard.signupTrend")}>
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<div className="text-[14px] leading-5 text-body">
							{t("dashboard.signupTrend")}
						</div>
					</CardHeader>
					<CardContent>
						<SignupLine data={signupSeries} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<div className="text-[14px] leading-5 text-body">
							{t("dashboard.channelDist")}
						</div>
					</CardHeader>
					<CardContent>
						<ChannelPie channels={ov.loginChannels} />
					</CardContent>
				</Card>
			</div>
		</Section>

			{/* Retention placeholder — requires a backend cohort endpoint. */}
			<EmptyState>
				<div className="font-mono text-[12px] uppercase tracking-wide text-mute">
					{t("dashboard.retention.title")}
				</div>
				<div className="text-[14px] leading-5 text-body">
					{t("dashboard.retention.hint")}
				</div>
			</EmptyState>
		</div>
	);
}
