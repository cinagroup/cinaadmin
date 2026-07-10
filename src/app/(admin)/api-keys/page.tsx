"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ApiKeyDTO {
	id: string;
	name: string;
	enabled: boolean;
	startsAt: string | null;
	expiresAt: string | null;
	prefix: string;
	lastUsedAt: string | null;
	remaining: number | null;
}

export default function ApiKeysPage() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const { data, isFetching } = useQuery({
		queryKey: ["api-keys"],
		queryFn: async () => {
			const r = await fetch("/api/admin/api-keys");
			const d = (await r.json()) as {
				ok: boolean;
				data?: { apiKeys: ApiKeyDTO[] } | ApiKeyDTO[];
			};
			if (!d.ok || !d.data) return [];
			return Array.isArray(d.data) ? d.data : (d.data.apiKeys ?? []);
		},
	});

	const keys = data ?? [];
	const [name, setName] = useState("");
	const [scope, setScope] = useState("read-users");
	const [creating, setCreating] = useState(false);

	const create = async () => {
		setCreating(true);
		await fetch("/api/admin/api-keys", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name, prefixes: [scope] }),
		});
		setCreating(false);
		setName("");
		await qc.invalidateQueries({ queryKey: ["api-keys"] });
	};

	const columns = useMemo<ColumnDef<ApiKeyDTO>[]>(
		() => [
			{ accessorKey: "name", header: t("organizations.col.name") },
			{
				accessorKey: "prefix",
				header: t("apiKeys.prefix"),
				cell: ({ row }) => (
					<span className="font-mono text-[12px] leading-4">
						{row.original.prefix}…
					</span>
				),
			},
			{
				header: t("users.col.status"),
				cell: ({ row }) =>
					row.original.enabled ? (
						<Badge variant="success">{t("common.enabled")}</Badge>
					) : (
						<Badge variant="muted">{t("common.disabled")}</Badge>
					),
			},
			{
				accessorKey: "expiresAt",
				header: t("common.expired"),
				cell: ({ row }) =>
					row.original.expiresAt
						? new Date(row.original.expiresAt).toLocaleDateString()
						: t("common.permanent"),
			},
		],
		[t],
	);

	const table = useReactTable({
		data: keys,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<PageHeader title={t("apiKeys.title")}>
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<Button variant="primary" size="sm">
								{t("apiKeys.create")}
							</Button>
						}
						title={t("apiKeys.create.title")}
						confirmText={creating ? t("common.creating") : t("common.create")}
						onConfirm={create}
					>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("apiKeys.name")}
						/>
						<Select value={scope} onValueChange={setScope}>
							<SelectTrigger className="h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="read-users">{t("apiKeys.scope.readUsers")}</SelectItem>
								<SelectItem value="verify-siwe">{t("apiKeys.scope.verifySiwe")}</SelectItem>
							</SelectContent>
						</Select>
					</ConfirmDialog>
				</RoleGuard>
			</PageHeader>
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("apiKeys.empty")}
			/>
		</div>
	);
}
