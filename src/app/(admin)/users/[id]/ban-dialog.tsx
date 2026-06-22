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

/** Ban dialog with duration (7d/30d/permanent) + reason. On confirm, POSTs
 *  /api/admin/users/[id]/ban then reloads. */
export function BanDialog({ userId }: { userId: string }) {
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
					封禁
				</Button>
			}
			title="封禁用户"
			danger
			confirmText="封禁"
			onConfirm={ban}
		>
			<Select value={duration} onValueChange={setDuration}>
				<SelectTrigger className="h-10">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="7d">7 天</SelectItem>
					<SelectItem value="30d">30 天</SelectItem>
					<SelectItem value="permanent">永久</SelectItem>
				</SelectContent>
			</Select>
			<Input
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				placeholder="封禁原因（审计留痕）"
			/>
		</ConfirmDialog>
	);
}
