"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#d4af37", "#6b6b73", "#242428"];

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
		return <div className="text-sm text-muted">暂无数据</div>;
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
					contentStyle={{ background: "#121214", border: "1px solid #242428" }}
				/>
				<Legend wrapperStyle={{ color: "#6b6b73" }} />
			</PieChart>
		</ResponsiveContainer>
	);
}
