"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogDTO } from "@/lib/cinaauth/dto";

export function LoginTrailTab({ userId }: { userId: string }) {
	const { data, isFetching } = useQuery({
		queryKey: ["user", userId, "login-trail"],
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: "50",
				action: "user.login",
				targetId: userId,
			});
			const r = await fetch(`/api/admin/audit?${params}`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { rows: AuditLogDTO[] };
			};
			return d.ok ? d.data?.rows ?? [] : [];
		},
	});

	const rows = data ?? [];

	const columns: ColumnDef<AuditLogDTO>[] = [
		{
			accessorKey: "timestamp",
			header: "时间",
			cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
		},
		{ accessorKey: "actorIp", header: "IP" },
		{ accessorKey: "actorUa", header: "设备" },
		{
			header: "结果",
			cell: ({ row }) =>
				row.original.result === "failure" ? (
					<Badge variant="danger">失败</Badge>
				) : (
					<Badge>成功</Badge>
				),
		},
	];

	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<DataTable
			table={table}
			rowClassName={(r) => (r.result === "failure" ? "bg-danger/5" : undefined)}
			emptyLabel={isFetching ? "加载中…" : "无登录记录"}
		/>
	);
}
