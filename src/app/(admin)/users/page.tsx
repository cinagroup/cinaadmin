"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { FilterBar, type FilterState } from "@/components/data-table/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import type { UserDTO } from "@/lib/cinaauth/dto";

const PAGE_SIZE = 20;

export default function UsersPage() {
	const [filter, setFilter] = useState<FilterState>({});
	const [offset, setOffset] = useState(0);

	const { data, isFetching } = useQuery({
		queryKey: ["users", filter, offset],
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: String(PAGE_SIZE),
				offset: String(offset),
				...(filter.searchField
					? { searchField: filter.searchField }
					: {}),
				...(filter.searchValue
					? { searchValue: filter.searchValue }
					: {}),
			});
			const r = await fetch(`/api/admin/users?${params}`);
			return (await r.json()) as {
				ok: boolean;
				data?: { users: UserDTO[]; total: number };
			};
		},
		placeholderData: keepPreviousData,
	});

	const users = data?.data?.users ?? [];
	const total = data?.data?.total ?? 0;

	const columns = useMemo<ColumnDef<UserDTO>[]>(
		() => [
			{
				accessorKey: "email",
				header: "邮箱",
				cell: ({ row }) => (
					<Link
						href={`/users/${row.original.id}`}
						className="text-gold-400 hover:underline"
					>
						{row.original.email}
					</Link>
				),
			},
			{ accessorKey: "name", header: "用户名" },
			{ accessorKey: "role", header: "角色" },
			{
				header: "状态",
				cell: ({ row }) =>
					row.original.banned ? (
						<Badge variant="danger">封禁</Badge>
					) : (
						<Badge>正常</Badge>
					),
			},
			{
				accessorKey: "createdAt",
				header: "注册时间",
				cell: ({ row }) =>
					new Date(row.original.createdAt).toLocaleDateString(),
			},
		],
		[],
	);

	const table = useReactTable({
		data: users,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const exportHref = `/api/admin/export?kind=users&${new URLSearchParams(
		filter as Record<string, string>,
	)}`;

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-serif text-xl text-gold-500">用户管理</h1>
				<a href={exportHref} className="text-sm text-gold-400">
					导出 CSV
				</a>
			</div>
			<FilterBar
				fields={[
					{ label: "邮箱", value: "email" },
					{ label: "用户名", value: "name" },
					{ label: "钱包", value: "wallet" },
				]}
				onChange={(f) => {
					setFilter(f);
					setOffset(0);
				}}
			/>
			<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "暂无用户"} />
			<Pagination
				offset={offset}
				pageSize={PAGE_SIZE}
				total={total}
				onPrev={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
				onNext={() => setOffset(offset + PAGE_SIZE)}
			/>
		</div>
	);
}
