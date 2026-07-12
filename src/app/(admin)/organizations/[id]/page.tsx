"use client";

export const runtime = "edge";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { RoleGuard } from "@/components/role-guard";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/i18n-context";
import { InviteDialog } from "./invite-dialog";

interface MemberDTO {
	id: string;
	userId: string;
	role: string;
	createdAt: string;
	user?: { name?: string; email?: string; image?: string | null };
}

export default function OrganizationDetailPage() {
	const { t } = useI18n();
	const params = useParams<{ id: string }>();
	const orgId = params.id;
	const qc = useQueryClient();

	const { data: org, isFetching } = useQuery({
		queryKey: ["organization", orgId],
		queryFn: async () => {
			const r = await fetch(`/api/admin/organizations/${orgId}`);
			const d = await r.json();
			return d.ok ? d.data : null;
		},
	});

	const { data: membersData } = useQuery({
		queryKey: ["organization-members", orgId],
		queryFn: async () => {
			const r = await fetch(`/api/admin/organizations/${orgId}/members`);
			const d = await r.json();
			return d.ok ? (d.data?.members ?? []) : [];
		},
	});

	const members: MemberDTO[] = membersData ?? [];

	const removeMember = async (memberId: string) => {
		await fetch(`/api/admin/organizations/${orgId}/members/${memberId}`, {
			method: "DELETE",
		});
		await qc.invalidateQueries({ queryKey: ["organization-members", orgId] });
	};

	const memberColumns: ColumnDef<MemberDTO>[] = [
		{
			accessorKey: "user.email",
			header: "Email",
			cell: ({ row }) => (
				<span className="font-medium text-ink">
					{row.original.user?.email ?? row.original.userId}
				</span>
			),
		},
		{
			accessorKey: "user.name",
			header: "Name",
			cell: ({ row }) => row.original.user?.name ?? "—",
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const role = row.original.role;
				return (
					<Badge variant={role === "owner" ? "success" : "default"}>
						{role}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<RoleGuard allow={["super_admin"]}>
					{row.original.role !== "owner" && (
						<ConfirmDialog
							trigger={
								<Button variant="ghost" size="sm" className="text-danger">
									{t("common.remove")}
								</Button>
							}
							title={t("organizations.removeMember")}
							onConfirm={() => removeMember(row.original.id)}
						/>
					)}
				</RoleGuard>
			),
		},
	];

	const table = useReactTable({
		data: members,
		columns: memberColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<PageHeader title={org?.name ?? t("common.loading")}>
				<RoleGuard allow={["super_admin"]}>
					<InviteDialog orgId={orgId} />
				</RoleGuard>
			</PageHeader>
			<div className="mb-4 flex items-center gap-4 text-sm text-ink-light">
				<span>Slug: {org?.slug ?? "—"}</span>
				<span>Members: {members.length}</span>
			</div>
			<DataTable
				table={table}
				emptyLabel={
					isFetching ? t("common.loading") : t("organizations.noMembers")
				}
			/>
		</div>
	);
}
