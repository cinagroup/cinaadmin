"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface OrgDTO {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
	membersCount?: number;
}

export default function OrganizationsPage() {
	const qc = useQueryClient();
	const { data, isFetching } = useQuery({
		queryKey: ["organizations"],
		queryFn: async () => {
			const r = await fetch("/api/admin/organizations");
			const d = (await r.json()) as {
				ok: boolean;
				data?: { organizations: OrgDTO[] };
			};
			return d.ok ? d.data?.organizations ?? [] : [];
		},
	});

	const orgs = data ?? [];

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [creating, setCreating] = useState(false);

	const create = async () => {
		setCreating(true);
		await fetch("/api/admin/organizations", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name, slug }),
		});
		setCreating(false);
		setName("");
		setSlug("");
		await qc.invalidateQueries({ queryKey: ["organizations"] });
	};

	const columns = useMemo<ColumnDef<OrgDTO>[]>(
		() => [
			{
				accessorKey: "name",
				header: "名称",
				cell: ({ row }) => (
					<Link
						href={`/organizations/${row.original.id}`}
						className="text-gold-400 hover:underline"
					>
						{row.original.name}
					</Link>
				),
			},
			{ accessorKey: "slug", header: "Slug" },
			{
				accessorKey: "createdAt",
				header: "创建时间",
				cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
			},
		],
		[],
	);

	const table = useReactTable({
		data: orgs,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-serif text-xl text-gold-500">组织 / 商户管理</h1>
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<span className="cursor-pointer text-sm text-gold-400">新建组织</span>
						}
						title="新建组织"
						confirmText={creating ? "创建中…" : "创建"}
						onConfirm={create}
					>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="组织名称"
							className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
						/>
						<input
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							placeholder="slug（唯一标识）"
							className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
						/>
					</ConfirmDialog>
				</RoleGuard>
			</div>
			<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "暂无组织"} />
		</div>
	);
}
