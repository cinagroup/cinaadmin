"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import type { SessionDTO } from "@/lib/cinaauth/dto";

export function SessionsTab({ userId }: { userId: string }) {
	const { data, isFetching } = useQuery({
		queryKey: ["user", userId, "sessions"],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${userId}/sessions`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { sessions: SessionDTO[] };
			};
			return d.ok ? d.data?.sessions ?? [] : [];
		},
	});

	const sessions = data ?? [];

	const columns: ColumnDef<SessionDTO>[] = [
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
	];

	const table = useReactTable({
		data: sessions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "无活跃会话"} />
	);
}
