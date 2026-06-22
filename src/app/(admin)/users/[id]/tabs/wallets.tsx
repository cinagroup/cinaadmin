"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoleGuard } from "@/components/role-guard";
import type { WalletDTO } from "@/lib/cinaauth/dto";

export function WalletsTab({ userId }: { userId: string }) {
	const { data, isFetching, refetch } = useQuery({
		queryKey: ["user", userId, "wallets"],
		queryFn: async () => {
			const r = await fetch(`/api/admin/users/${userId}/wallets`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { wallets: WalletDTO[] };
			};
			return d.ok ? d.data?.wallets ?? [] : [];
		},
	});

	const wallets = data ?? [];

	const unbind = async (w: WalletDTO) => {
		await fetch(`/api/admin/users/${userId}/wallets/${w.address}`, {
			method: "DELETE",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ chainId: w.chainId }),
		});
		await refetch();
	};

	const columns: ColumnDef<WalletDTO>[] = [
		{
			accessorKey: "address",
			header: "地址",
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.original.address}</span>
			),
		},
		{ accessorKey: "chainId", header: "链 ID" },
		{
			header: "主钱包",
			cell: ({ row }) =>
				row.original.isPrimary ? <Badge variant="success">主</Badge> : null,
		},
		{
			accessorKey: "boundAt",
			header: "绑定时间",
			cell: ({ row }) => new Date(row.original.boundAt).toLocaleString(),
		},
		{ accessorKey: "boundIp", header: "绑定 IP" },
		{ accessorKey: "boundSite", header: "来源站点" },
		{
			id: "actions",
			header: "操作",
			cell: ({ row }) => (
				<RoleGuard allow={["super_admin", "security_admin"]}>
					<ConfirmDialog
						trigger={
							<span className="cursor-pointer text-xs text-danger">解绑</span>
						}
						title="解绑钱包"
						description={`将解绑 ${row.original.address}，该钱包相关会话将吊销。`}
						danger
						confirmText="解绑"
						onConfirm={() => unbind(row.original)}
					/>
				</RoleGuard>
			),
		},
	];

	const table = useReactTable({
		data: wallets,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "未绑定钱包"} />
	);
}
