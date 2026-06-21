"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogDTO } from "@/lib/cinaauth/dto";

const CATEGORIES = [
	"user",
	"session",
	"auth",
	"admin",
	"risk",
	"wallet",
	"org",
	"apikey",
];

export default function AuditPage() {
	const [category, setCategory] = useState("");
	const [result, setResult] = useState("");

	const { data, isFetching } = useQuery({
		queryKey: ["audit", category, result],
		queryFn: async () => {
			const qs = new URLSearchParams({
				limit: "100",
				...(category && { category }),
				...(result && { result }),
			});
			const r = await fetch(`/api/admin/audit?${qs}`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { rows: AuditLogDTO[] };
			};
			return d.ok ? d.data?.rows ?? [] : [];
		},
	});

	const rows = data ?? [];

	const columns = useMemo<ColumnDef<AuditLogDTO>[]>(
		() => [
			{
				accessorKey: "timestamp",
				header: "时间",
				cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
			},
			{ accessorKey: "category", header: "类别" },
			{ accessorKey: "action", header: "操作" },
			{ accessorKey: "actorId", header: "操作者" },
			{ accessorKey: "actorIp", header: "IP" },
			{
				header: "结果",
				cell: ({ row }) =>
					row.original.result === "failure" ? (
						<Badge variant="danger">失败</Badge>
					) : (
						<Badge>成功</Badge>
					),
			},
		],
		[],
	);

	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const exportHref = `/api/admin/export?kind=audit&${new URLSearchParams({
		...(category && { category }),
		...(result && { result }),
	})}`;

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-serif text-xl text-gold-500">审计日志</h1>
				<a href={exportHref} className="text-sm text-gold-400">
					导出 CSV
				</a>
			</div>
			<div className="mb-4 flex gap-2">
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="rounded border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
				>
					<option value="">全部类别</option>
					{CATEGORIES.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
				<select
					value={result}
					onChange={(e) => setResult(e.target.value)}
					className="rounded border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
				>
					<option value="">全部结果</option>
					<option value="success">成功</option>
					<option value="failure">失败</option>
				</select>
			</div>
			<DataTable
				table={table}
				rowClassName={(r) =>
					r.result === "failure" ? "bg-danger/5" : undefined
				}
				emptyLabel={isFetching ? "加载中…" : "暂无审计记录"}
			/>
		</div>
	);
}
