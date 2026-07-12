"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { ApiKeyDTO } from "@/lib/cinaauth/dto";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	const [createdKey, setCreatedKey] = useState<string | null>(null);

	const create = async () => {
		setCreating(true);
		const r = await fetch("/api/admin/api-keys", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name, prefixes: [scope] }),
		});
		setCreating(false);
		setName("");
		// Capture the generated key — it's only returned once at creation.
		const d = (await r.json().catch(() => ({}))) as {
			ok?: boolean;
			data?: { key?: string; apiKeys?: Array<{ key?: string }> };
		};
		const key = d.data?.key ?? d.data?.apiKeys?.[0]?.key;
		if (key) {
			setCreatedKey(key);
		}
		await qc.invalidateQueries({ queryKey: ["api-keys"] });
	};

	const toggleKey = async (id: string, enabled: boolean) => {
		await fetch(`/api/admin/api-keys/${id}/toggle`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ enabled }),
		});
		await qc.invalidateQueries({ queryKey: ["api-keys"] });
	};

	const deleteKey = async (id: string) => {
		await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
		await qc.invalidateQueries({ queryKey: ["api-keys"] });
	};

	const rotateKey = async (id: string) => {
		const r = await fetch(`/api/admin/api-keys/${id}/rotate`, { method: "POST" });
		const d = (await r.json().catch(() => ({}))) as {
			ok?: boolean;
			data?: { key?: string };
		};
		if (d.data?.key) {
			setCreatedKey(d.data.key);
		}
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
			{
				accessorKey: "lastUsedAt",
				header: t("apiKeys.lastUsed"),
				cell: ({ row }) =>
					row.original.lastUsedAt
						? new Date(row.original.lastUsedAt).toLocaleDateString()
						: "—",
			},
			{
				accessorKey: "remaining",
				header: t("apiKeys.remaining"),
				cell: ({ row }) =>
					row.original.remaining != null
						? row.original.remaining
						: t("common.permanent"),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => {
					const key = row.original;
					return (
						<RoleGuard allow={["super_admin"]}>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleKey(key.id, !key.enabled)}
								>
									{key.enabled ? t("common.disable") : t("common.enable")}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => rotateKey(key.id)}
								>
									{t("common.rotate")}
								</Button>
								<ConfirmDialog
									trigger={
										<Button variant="ghost" size="sm" className="text-danger">
											{t("common.delete")}
										</Button>
									}
									title={t("apiKeys.delete.title")}
									onConfirm={() => deleteKey(key.id)}
								/>
							</div>
						</RoleGuard>
					);
				},
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

			{/* Key reveal dialog — shown only once after creation */}
			{createdKey && (
				<Dialog open={!!createdKey} onOpenChange={(o) => !o && setCreatedKey(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("apiKeys.created.title")}</DialogTitle>
							<DialogDescription>{t("apiKeys.created.warning")}</DialogDescription>
						</DialogHeader>
						<div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-hairline bg-canvas-soft p-3">
							<code className="flex-1 break-all font-mono text-[13px] text-ink">
								{createdKey}
							</code>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									navigator.clipboard?.writeText(createdKey);
									toast.success(t("apiKeys.created.copied"));
								}}
							>
								{t("apiKeys.created.copy")}
							</Button>
						</div>
						<DialogFooter>
							<Button variant="primary" size="sm" onClick={() => setCreatedKey(null)}>
								{t("apiKeys.created.close")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
