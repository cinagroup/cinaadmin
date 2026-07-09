"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
} from "recharts";
import { useThemeTokens } from "@/hooks/use-theme-tokens";

interface AuditRow {
	timestamp: string;
	actorId?: string | null;
	result?: string | null;
}
interface SignupPoint {
	date: string;
	count: number;
}

/**
 * Stacked cohort bar — the signature BAC chart. Three series stacked per day:
 *  - 新增 (new): users who signed up that day (from the signup series)
 *  - 回流 (reactivated): login events from users who did NOT sign up that day
 *
 * NOTE: true retention cohorts (next-day / 7-day retained) need a backend
 * cohort endpoint cinaauth doesn't expose. This is a login-derived proxy that
 * matches BAC's *visual* language (stacked bars, hidden Y axis, 3 accent
 * tints). Swap in real cohort data when the endpoint lands.
 *
 * Y-axis is intentionally hidden to mirror BAC (relative shape matters more
 * than exact counts on this overview).
 */
export function CohortBars({ days = 14 }: { days?: number }) {
	const { data: logins } = useQuery<AuditRow[]>({
		queryKey: ["cohort-logins", days],
		queryFn: async () => {
			const r = await fetch(
				`/api/admin/audit?action=user.login&result=success&limit=1000`,
			);
			const d = (await r.json()) as {
				ok?: boolean;
				data?: { rows?: AuditRow[] };
			};
			return d.ok ? d.data?.rows ?? [] : [];
		},
	});
	const { data: signups } = useQuery<SignupPoint[]>({
		queryKey: ["cohort-signups", days],
		queryFn: async () => {
			const r = await fetch(`/api/admin/stats/signups?range=30d`);
			const d = (await r.json()) as {
				ok?: boolean;
				data?: { data?: SignupPoint[] };
			};
			return d.ok ? d.data?.data ?? [] : [];
		},
	});

	// Build day buckets for the window.
	const byDay = new Map<string, { newUsers: number; returning: number }>();
	const today = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		byDay.set(d.toISOString().slice(0, 10), { newUsers: 0, returning: 0 });
	}
	// New users per day from the signup series.
	for (const p of signups ?? []) {
		const day = (p.date ?? "").slice(0, 10);
		const b = byDay.get(day);
		if (b) b.newUsers = p.count;
	}
	// Returning = successful logins whose actor did NOT sign up that same day.
	// (Approximation: distinct actor per day, minus that day's new signups.)
	const actorsPerDay = new Map<string, Set<string>>();
	for (const day of byDay.keys()) actorsPerDay.set(day, new Set<string>());
	for (const row of logins ?? []) {
		const day = (row.timestamp ?? "").slice(0, 10);
		const set = actorsPerDay.get(day);
		if (set) set.add(row.actorId ?? "anon");
	}
	for (const [day, b] of byDay.entries()) {
		const distinct = actorsPerDay.get(day)?.size ?? 0;
		b.returning = Math.max(0, distinct - b.newUsers);
	}

	const chartData = Array.from(byDay.entries()).map(([date, b]) => ({
		date: date.slice(5), // MM-DD
		新增: b.newUsers,
		回流: b.returning,
	}));

	const { v, themeKey } = useThemeTokens();
	// Indigo tints for the stacked segments (BAC chart palette).
	const c1 = v("--chart-1", "#4f39f6");
	const c2 = v("--chart-2", "#625fff");

	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart key={themeKey} data={chartData} barCategoryGap="20%">
				<XAxis
					dataKey="date"
					stroke={v("--mute", "#888")}
					fontSize={11}
					tickLine={false}
					axisLine={false}
				/>
				{/* Y-axis intentionally hidden — BAC shows relative shape only */}
				<Tooltip
					cursor={{ fill: v("--canvas-soft-2", "#f5f5f5"), radius: 4 }}
					contentStyle={{
						background: v("--canvas", "#fff"),
						border: `1px solid ${v("--hairline", "#ebebeb")}`,
						borderRadius: "6px",
						color: v("--ink", "#171717"),
					}}
				/>
				<Bar
					dataKey="新增"
					stackId="cohort"
					fill={c1}
					radius={[0, 0, 0, 0]}
				/>
				<Bar
					dataKey="回流"
					stackId="cohort"
					fill={c2}
					radius={[4, 4, 0, 0]}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}
