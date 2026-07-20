"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
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
	const [dateRange, setDateRange] = useState("all");
	const [search, setSearch] = useState("");

	// Only the server-side facets belong in the query key. `search` is a
	// purely client-side filter over the already-fetched page, so keeping it
	// out of the key means typing filters instantly without re-hitting the API
	// on every keystroke.
	const { data, isFetching } = useQuery({
		queryKey: ["audit", category, result, dateRange],
		queryFn: async () => {
			const now = new Date();
			const qs = new URLSearchParams({
				limit: "100",
				...(category !== "all" && { category }),
				...(result !== "all" && { result }),
			});
			if (dateRange !== "all") {
				const days = parseInt(dateRange, 10);
				const start = new Date(now);
				start.setDate(start.getDate() - days);
				qs.set("start", start.toISOString());
			}
			const r = await fetch(`/api/admin/audit?${qs}`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { rows: AuditLogDTO[] };
			};
			return d.ok ? d.data?.rows ?? [] : [];
		},
	});

	// Client-side search filter (IP, actor, action, target, category).
	const rows = useMemo(() => {
		const all = data ?? [];
		const q = search.trim().toLowerCase();
		if (!q) return all;
		return all.filter((r) =>
			(r.actorIp ?? "").toLowerCase().includes(q) ||
			(r.actorId ?? "").toLowerCase().includes(q) ||
			(r.action ?? "").toLowerCase().includes(q) ||
			(r.targetId ?? "").toLowerCase().includes(q) ||
			(r.category ?? "").toLowerCase().includes(q),
		);
	}, [data, search]);

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
			{
				accessorKey: "actorIp",
				header: t("audit.col.ip"),
				cell: ({ row }) => {
					const ip = row.original.actorIp;
					if (!ip) return "—";
					// Mask last two octets for privacy: 1.2.3.4 → 1.2.x.x
					const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
					if (v4) return (
						<span className="font-mono text-[12px] text-mute">{v4[1]}.{v4[2]}.x.x</span>
					);
					return <span className="font-mono text-[12px] text-mute">{ip}</span>;
				},
			},
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
				<Select value={dateRange} onValueChange={setDateRange}>
					<SelectTrigger className="h-10 w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("audit.allTime")}</SelectItem>
						<SelectItem value="1">{t("audit.last1d")}</SelectItem>
						<SelectItem value="7">{t("audit.last7d")}</SelectItem>
						<SelectItem value="30">{t("audit.last30d")}</SelectItem>
					</SelectContent>
				</Select>
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t("common.search")}
						className="h-10 w-full rounded-[var(--radius-sm)] border border-hairline bg-canvas pl-9 pr-3 text-[14px] text-ink placeholder:text-mute focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
					/>
				</div>
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
