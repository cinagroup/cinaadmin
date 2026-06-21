"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { SessionDTO } from "@/lib/cinaauth/dto";

export default function SessionsPage() {
	const { data, isFetching } = useQuery({
		queryKey: ["sessions", "all"],
		queryFn: async () => {
			const r = await fetch("/api/admin/sessions?limit=100");
			const d = (await r.json()) as {
				ok: boolean;
				data?: { sessions: SessionDTO[] };
			};
			return d.ok ? d.data?.sessions ?? [] : [];
		},
	});

	const sessions = data ?? [];

	const columns = useMemo<ColumnDef<SessionDTO>[]>(
		() => [
			{ accessorKey: "userId", header: "用户 ID" },
			{
				accessorKey: "createdAt",
				header: "创建时间",
				cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
			},
			{
				accessorKey: "expiresAt",
				header: "过期时间",
				cell: ({ row }) => new Date(row.original.expiresAt).toLocaleString(),
			},
			{ accessorKey: "ipAddress", header: "IP" },
			{ accessorKey: "userAgent", header: "设备" },
		],
		[],
	);

	const table = useReactTable({
		data: sessions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<h1 className="mb-4 font-serif text-xl text-gold-500">会话管理</h1>
			<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "无会话"} />
		</div>
	);
}
