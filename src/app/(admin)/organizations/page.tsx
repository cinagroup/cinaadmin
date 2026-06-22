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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

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
						className="text-link underline-offset-4 hover:underline"
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
			<PageHeader title="组织 / 商户管理">
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<Button variant="primary" size="sm">
								新建组织
							</Button>
						}
						title="新建组织"
						confirmText={creating ? "创建中…" : "创建"}
						onConfirm={create}
					>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="组织名称"
						/>
						<Input
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							placeholder="slug（唯一标识）"
						/>
					</ConfirmDialog>
				</RoleGuard>
			</PageHeader>
			<DataTable table={table} emptyLabel={isFetching ? "加载中…" : "暂无组织"} />
		</div>
	);
}
