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
import { useI18n } from "@/lib/i18n/i18n-context";
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
	const { t } = useI18n();
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
				header: t("audit.col.time"),
				cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
			},
			{ accessorKey: "category", header: t("audit.col.category") },
			{ accessorKey: "action", header: t("audit.col.action") },
			{ accessorKey: "actorId", header: t("audit.col.actor") },
			{ accessorKey: "actorIp", header: t("audit.col.ip") },
			{
				header: t("audit.col.result"),
				cell: ({ row }) =>
					row.original.result === "failure" ? (
						<Badge variant="danger">{t("common.result.failure")}</Badge>
					) : (
						<Badge variant="success">{t("common.result.success")}</Badge>
					),
			},
		],
		[t],
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
			<PageHeader title={t("audit.title")}>
				<Button asChild variant="secondary" size="sm">
					<a href={exportHref}>{t("audit.export")}</a>
				</Button>
			</PageHeader>
			<div className="mb-4 flex gap-2">
				<Select value={category} onValueChange={setCategory}>
					<SelectTrigger className="h-10 w-[160px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("audit.allCategories")}</SelectItem>
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
						<SelectItem value="all">{t("audit.allResults")}</SelectItem>
						<SelectItem value="success">{t("common.result.success")}</SelectItem>
						<SelectItem value="failure">{t("common.result.failure")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<DataTable
				table={table}
				rowClassName={(r) =>
					r.result === "failure" ? "bg-error-soft" : undefined
				}
				emptyLabel={isFetching ? t("common.loading") : t("audit.empty")}
			/>
		</div>
	);
}
