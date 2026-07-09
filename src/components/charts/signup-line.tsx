"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

/**
 * Daily signup trend line chart. Colors read from CSS custom properties so
 * the chart re-tints with the active theme (uses --canvas / --hairline /
 * --body / --accent defined in globals.css).
 */
export function SignupLine({
	data,
}: {
	data: { date: string; count: number }[];
}) {
	// Recharts runs in the browser; read the resolved theme tokens at render.
	const css = (typeof window !== "undefined"
		? getComputedStyle(document.documentElement)
		: null) ?? undefined;
	const v = (name: string, fallback: string) =>
		css?.getPropertyValue(name).trim() || fallback;

	return (
		<ResponsiveContainer width="100%" height={240}>
			<LineChart data={data}>
				<CartesianGrid
					stroke={v("--hairline", "#ebebeb")}
					strokeDasharray="3 3"
					vertical={false}
				/>
				<XAxis
					dataKey="date"
					stroke={v("--mute", "#888")}
					fontSize={11}
					tickLine={false}
					axisLine={{ stroke: v("--hairline", "#ebebeb") }}
				/>
				<YAxis
					stroke={v("--mute", "#888")}
					fontSize={11}
					allowDecimals={false}
					tickLine={false}
					axisLine={false}
				/>
				<Tooltip
					contentStyle={{
						background: v("--canvas", "#fff"),
						border: `1px solid ${v("--hairline", "#ebebeb")}`,
						borderRadius: "6px",
						color: v("--ink", "#171717"),
					}}
				/>
				<Line
					type="monotone"
					dataKey="count"
					stroke={v("--accent", "#8b5cf6")}
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
