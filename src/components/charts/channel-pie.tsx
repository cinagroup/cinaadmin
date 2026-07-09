"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Accent palette — reads theme tokens so slices + tooltip re-tint in dark.
/** Login-channel distribution pie (email/password, github, siwe). */
export function ChannelPie({
	channels,
}: {
	channels: Record<string, number>;
}) {
	const data = [
		{ name: "邮箱密码", value: channels.emailPassword ?? 0 },
		{ name: "GitHub", value: channels.github ?? 0 },
		{ name: "SIWE", value: channels.siwe ?? 0 },
	].filter((d) => d.value > 0);

	const css =
		typeof window !== "undefined"
			? getComputedStyle(document.documentElement)
			: null;
	const v = (name: string, fallback: string) =>
		css?.getPropertyValue(name).trim() || fallback;
	const COLORS = [
		v("--accent", "#8b5cf6"),
		v("--violet", "#7928ca"),
		v("--cyan", "#50e3c2"),
	];

	if (data.length === 0) {
		return <div className="text-[14px] leading-5 text-mute">暂无数据</div>;
	}

	return (
		<ResponsiveContainer width="100%" height={240}>
			<PieChart>
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
