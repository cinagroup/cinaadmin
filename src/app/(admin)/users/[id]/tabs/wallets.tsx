"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { WalletDTO } from "@/lib/cinaauth/dto";

export function WalletsTab({ userId }: { userId: string }) {
	const { data, isFetching } = useQuery({
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
				row.original.isPrimary ? <Badge variant="gold">主</Badge> : null,
		},
		{
			accessorKey: "boundAt",
			header: "绑定时间",
			cell: ({ row }) =>
				new Date(row.original.boundAt).toLocaleString(),
		},
		{ accessorKey: "boundIp", header: "绑定 IP" },
		{ accessorKey: "boundSite", header: "来源站点" },
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
