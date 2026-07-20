"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Floating action bar shown when table rows are selected.
 * Supports batch ban and batch delete for the users page.
 */
export function BatchActionBar({
	selectedIds,
	onClear,
}: {
	selectedIds: string[];
	onClear: () => void;
}) {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [loading, setLoading] = useState(false);

	if (selectedIds.length === 0) return null;

	const runBatch = async (action: "ban" | "delete") => {
		setLoading(true);
		const r = await fetch("/api/admin/users/batch", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ action, userIds: selectedIds }),
		});
		setLoading(false);
		const d = (await r.json().catch(() => ({}))) as {
			ok?: boolean;
			data?: { succeeded: number; failed: number };
		};
		if (d.ok) {
			const count = d.data?.succeeded ?? 0;
			toast.success(
				action === "ban"
					? t("batch.result.banned", { count })
					: t("batch.result.deleted", { count }),
			);
		} else if (d.data && d.data.failed > 0) {
			toast.warning(
				t("batch.result.partial", {
					ok: d.data.succeeded,
					failed: d.data.failed,
				}),
			);
		} else {
			toast.error(t("toast.saveFailed"));
		}
		onClear();
		await qc.invalidateQueries({ queryKey: ["users"] });
	};

	return (
		<div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-[var(--radius)] border border-hairline bg-canvas px-4 py-2.5 shadow-lg">
			<span className="text-sm font-medium text-ink">
				{t("batch.selected", { count: selectedIds.length })}
			</span>
			<div className="h-4 w-px bg-hairline" />
			<ConfirmDialog
				trigger={
					<Button variant="secondary" size="sm" disabled={loading}>
						{t("userDetail.actions.ban")}
					</Button>
				}
				title={t("batch.ban.title")}
				description={t("batch.ban.confirm", { count: selectedIds.length })}
				onConfirm={() => runBatch("ban")}
			/>
			<ConfirmDialog
				trigger={
					<Button variant="danger" size="sm" disabled={loading}>
						{t("common.delete")}
					</Button>
				}
				title={t("batch.delete.title")}
				description={t("batch.delete.confirm", { count: selectedIds.length })}
				danger
				onConfirm={() => runBatch("delete")}
			/>
			<Button variant="ghost" size="sm" onClick={onClear}>
				{t("common.cancel")}
			</Button>
		</div>
	);
}
