"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { OrgDTO } from "@/lib/cinaauth/dto";

export default function OrganizationsPage() {
	const { t } = useI18n();
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
		const r = await fetch("/api/admin/organizations", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name, slug }),
		});
		setCreating(false);
		if (r.ok) {
			setName("");
			setSlug("");
		} else {
			// Keep the form values so the admin can retry.
			toast.error(t("toast.createFailed"));
		}
		await qc.invalidateQueries({ queryKey: ["organizations"] });
	};

	const columns = useMemo<ColumnDef<OrgDTO>[]>(
		() => [
			{
				accessorKey: "name",
				header: t("organizations.col.name"),
				cell: ({ row }) => (
					<span className="font-medium text-ink">{row.original.name}</span>
				),
			},
			{ accessorKey: "slug", header: t("organizations.col.slug") },
			{
				accessorKey: "membersCount",
				header: "Members",
				cell: ({ row }) => row.original.membersCount ?? "—",
			},
			{
				accessorKey: "createdAt",
				header: t("organizations.col.createdAt"),
				cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
			},
		],
		[t],
	);

	const table = useReactTable({
		data: orgs,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<PageHeader title={t("organizations.title")}>
				<RoleGuard allow={["super_admin"]}>
					<ConfirmDialog
						trigger={
							<Button variant="primary" size="sm">
								{t("organizations.create")}
							</Button>
						}
						title={t("organizations.create")}
						confirmText={creating ? t("common.creating") : t("common.create")}
						onConfirm={create}
					>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("organizations.name")}
						/>
						<Input
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							placeholder={t("organizations.slug")}
						/>
					</ConfirmDialog>
				</RoleGuard>
			</PageHeader>
			<DataTable
				table={table}
				emptyLabel={isFetching ? t("common.loading") : t("organizations.empty")}
			/>
		</div>
	);
}
