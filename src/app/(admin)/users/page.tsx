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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { UserDTO } from "@/lib/cinaauth/dto";

const PAGE_SIZE = 20;

export default function UsersPage() {
	const { t } = useI18n();
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
				header: t("users.col.email"),
				cell: ({ row }) => (
					<Link
						href={`/users/${row.original.id}`}
						className="text-link underline-offset-4 hover:underline"
					>
						{row.original.email}
					</Link>
				),
			},
			{ accessorKey: "name", header: t("users.col.name") },
			{ accessorKey: "role", header: t("users.col.role") },
			{
				header: t("users.col.status"),
				cell: ({ row }) =>
					row.original.banned ? (
						<Badge variant="danger">{t("users.status.banned")}</Badge>
					) : (
						<Badge variant="success">{t("users.status.active")}</Badge>
					),
			},
			{
				accessorKey: "createdAt",
				header: t("users.col.createdAt"),
				cell: ({ row }) =>
					new Date(row.original.createdAt).toLocaleDateString(),
			},
		],
		[t],
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
			<PageHeader title={t("users.title")}>
				<Button asChild variant="secondary" size="sm">
					<a href={exportHref}>{t("common.export")}</a>
				</Button>
			</PageHeader>
			<FilterBar
				fields={[
					{ label: t("users.col.email"), value: "email" },
					{ label: t("users.col.name"), value: "name" },
					{ label: t("users.col.wallet"), value: "wallet" },
				]}
				onChange={(f) => {
					setFilter(f);
					setOffset(0);
				}}
			/>
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("users.empty")}
			/>
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
