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
			{ accessorKey: "name", header: "名称" },
			{
				accessorKey: "prefix",
				header: "前缀",
				cell: ({ row }) => (
					<span className="font-mono text-xs">{row.original.prefix}…</span>
				),
			},
			{
				header: "状态",
				cell: ({ row }) =>
					row.original.enabled ? (
						<Badge>启用</Badge>
					) : (
						<Badge variant="muted">禁用</Badge>
					),
			},
			{
				accessorKey: "expiresAt",
				header: "过期",
				cell: ({ row }) =>
					row.original.expiresAt
						? new Date(row.original.expiresAt).toLocaleDateString()
						: "永久",
			},
		],
		[],
	);

	const table = useReactTable({
		data: keys,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-serif text-xl text-gold-500">API 密钥管理</h1>
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<span className="cursor-pointer text-sm text-gold-400">创建密钥</span>
						}
						title="创建 API 密钥"
						confirmText={creating ? "创建中…" : "创建"}
						onConfirm={create}
					>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="密钥名称"
							className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
						/>
						<select
							value={scope}
							onChange={(e) => setScope(e.target.value)}
							className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
						>
							<option value="read-users">仅查用户</option>
							<option value="verify-siwe">仅验签 SIWE</option>
						</select>
					</ConfirmDialog>
				</RoleGuard>
			</div>
			<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "暂无密钥"} />
		</div>
	);
}
