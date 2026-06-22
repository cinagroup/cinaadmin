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
				<CartesianGrid stroke="#ebebeb" strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={{ stroke: "#ebebeb" }} />
				<YAxis stroke="#888888" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
				<Tooltip
					contentStyle={{
						background: "#ffffff",
						border: "1px solid #ebebeb",
						borderRadius: "6px",
						color: "#171717",
					}}
				/>
				<Line
					type="monotone"
					dataKey="count"
					stroke="#0070f3"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
