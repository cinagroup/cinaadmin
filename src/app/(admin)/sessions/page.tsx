"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { SessionDTO } from "@/lib/cinaauth/dto";

export default function SessionsPage() {
	const { t } = useI18n();
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
			{ accessorKey: "userId", header: t("sessions.col.userId") },
			{
				accessorKey: "createdAt",
				header: t("sessions.col.createdAt"),
				cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
			},
			{
				accessorKey: "expiresAt",
				header: t("sessions.col.expiresAt"),
				cell: ({ row }) => new Date(row.original.expiresAt).toLocaleString(),
			},
			{ accessorKey: "ipAddress", header: t("sessions.col.ip") },
			{ accessorKey: "userAgent", header: t("sessions.col.device") },
		],
		[t],
	);

	const table = useReactTable({
		data: sessions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<PageHeader title={t("sessions.title")} />
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("sessions.empty")}
			/>
		</div>
	);
}
