"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useThemeTokens } from "@/hooks/use-theme-tokens";

/**
 * Login-channel distribution pie (email/password, github, siwe). Colors read
 * theme tokens; `themeKey` forces a remount on theme switch so recharts
 * re-tints slices + tooltip.
 */
export function ChannelPie({
	channels,
}: {
	channels: Record<string, number>;
}) {
	const { v, themeKey } = useThemeTokens();
	const data = [
		{ name: "Email", value: channels.emailPassword ?? 0 },
		{ name: "GitHub", value: channels.github ?? 0 },
		{ name: "SIWE", value: channels.siwe ?? 0 },
	].filter((d) => d.value > 0);

	const COLORS = [
		v("--chart-1", "#4f39f6"),
		v("--chart-2", "#625fff"),
		v("--chart-4", "#97a9ff"),
	];

	if (data.length === 0) {
		return <div className="text-[14px] leading-5 text-mute">No data</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={240}>
			<PieChart key={themeKey}>
				<Pie
					data={data}
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={80}
					label
				>
					{data.map((_, i) => (
						<Cell key={i} fill={COLORS[i % COLORS.length]} />
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						background: v("--canvas", "#fff"),
						border: `1px solid ${v("--hairline", "#ebebeb")}`,
						borderRadius: "6px",
						color: v("--ink", "#171717"),
					}}
				/>
				<Legend wrapperStyle={{ color: v("--body", "#4d4d4d") }} />
			</PieChart>
		</ResponsiveContainer>
	);
}
