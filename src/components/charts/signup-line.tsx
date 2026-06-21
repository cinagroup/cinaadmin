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

/** Daily signup trend line chart. */
export function SignupLine({
	data,
}: {
	data: { date: string; count: number }[];
}) {
	return (
		<ResponsiveContainer width="100%" height={240}>
			<LineChart data={data}>
				<CartesianGrid stroke="#242428" strokeDasharray="3 3" />
				<XAxis dataKey="date" stroke="#6b6b73" fontSize={11} />
				<YAxis stroke="#6b6b73" fontSize={11} allowDecimals={false} />
				<Tooltip
					contentStyle={{ background: "#121214", border: "1px solid #242428" }}
				/>
				<Line
					type="monotone"
					dataKey="count"
					stroke="#d4af37"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
