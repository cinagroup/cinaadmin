"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoleGuard } from "@/components/role-guard";
import type { SessionDTO } from "@/lib/cinaauth/dto";

export function SessionsTab({ userId }: { userId: string }) {
	const { data, isFetching, refetch } = useQuery({
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

	const revokeAll = async () => {
		await fetch("/api/admin/sessions/revoke", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ userId }),
		});
		await refetch();
	};

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
		<div>
			<div className="mb-4 flex justify-end">
				<RoleGuard allow={["super_admin", "security_admin"]}>
					<ConfirmDialog
						trigger={
							<span className="cursor-pointer text-sm text-danger">
								吊销全部会话
							</span>
						}
						title="吊销全部会话"
						description="该用户的所有活跃会话将被立即吊销，需重新登录。"
						danger
						confirmText="吊销全部"
						onConfirm={revokeAll}
					/>
				</RoleGuard>
			</div>
			<DataTable
				table={table}
				emptyLabel={isFetching ? "加载中…" : "无活跃会话"}
			/>
		</div>
	);
}
