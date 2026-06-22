"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Brand accent palette (link / violet / cyan) — no gold in the light theme.
const COLORS = ["#0070f3", "#7928ca", "#50e3c2"];

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
						background: "#ffffff",
						border: "1px solid #ebebeb",
						borderRadius: "6px",
						color: "#171717",
					}}
				/>
				<Legend wrapperStyle={{ color: "#4d4d4d" }} />
			</PieChart>
		</ResponsiveContainer>
	);
}
