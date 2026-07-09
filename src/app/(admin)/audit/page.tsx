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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	const [category, setCategory] = useState("all");
	const [result, setResult] = useState("all");

	const { data, isFetching } = useQuery({
		queryKey: ["audit", category, result],
		queryFn: async () => {
			const qs = new URLSearchParams({
				limit: "100",
				...(category !== "all" && { category }),
				...(result !== "all" && { result }),
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
						<Badge variant="success">成功</Badge>
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
		...(category !== "all" && { category }),
		...(result !== "all" && { result }),
	})}`;

	return (
		<div>
			<PageHeader title="审计日志">
				<Button asChild variant="secondary" size="sm">
					<a href={exportHref}>导出 CSV</a>
				</Button>
			</PageHeader>
			<div className="mb-4 flex gap-2">
				<Select value={category} onValueChange={setCategory}>
					<SelectTrigger className="h-10 w-[160px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全部类别</SelectItem>
						{CATEGORIES.map((c) => (
							<SelectItem key={c} value={c}>
								{c}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={result} onValueChange={setResult}>
					<SelectTrigger className="h-10 w-[160px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全部结果</SelectItem>
						<SelectItem value="success">成功</SelectItem>
						<SelectItem value="failure">失败</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<DataTable
				table={table}
				rowClassName={(r) =>
					r.result === "failure" ? "bg-[var(--error-soft)]" : undefined
				}
				emptyLabel={isFetching ? "加载中…" : "暂无审计记录"}
			/>
		</div>
	);
}
