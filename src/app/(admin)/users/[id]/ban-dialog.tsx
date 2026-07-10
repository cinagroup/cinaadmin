"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Ban dialog with duration (7d/30d/permanent) + reason. On confirm, POSTs
 *  /api/admin/users/[id]/ban then reloads. */
export function BanDialog({ userId }: { userId: string }) {
	const { t } = useI18n();
	const [duration, setDuration] = useState("permanent");
	const [reason, setReason] = useState("");

	const ban = async () => {
		const expirationTime =
			duration === "7d"
				? new Date(Date.now() + 7 * 86_400_000).toISOString()
				: duration === "30d"
					? new Date(Date.now() + 30 * 86_400_000).toISOString()
					: undefined;
		await fetch(`/api/admin/users/${userId}/ban`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				banReason: reason,
				...(expirationTime ? { expirationTime } : {}),
			}),
		});
		window.location.reload();
	};

	return (
		<ConfirmDialog
			trigger={
				<Button variant="danger" size="sm">
					{t("userDetail.actions.ban")}
				</Button>
			}
			title={t("userDetail.ban.title")}
			danger
			confirmText={t("userDetail.actions.ban")}
			onConfirm={ban}
		>
			<Select value={duration} onValueChange={setDuration}>
				<SelectTrigger className="h-10">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="7d">{t("userDetail.ban.7d")}</SelectItem>
					<SelectItem value="30d">{t("userDetail.ban.30d")}</SelectItem>
					<SelectItem value="permanent">{t("common.permanent")}</SelectItem>
				</SelectContent>
			</Select>
			<Input
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				placeholder={t("userDetail.ban.reason")}
			/>
		</ConfirmDialog>
	);
}
