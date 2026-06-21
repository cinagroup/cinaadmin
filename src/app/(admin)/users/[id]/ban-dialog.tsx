"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
			trigger={<span className="cursor-pointer text-sm text-danger">封禁</span>}
			title="封禁用户"
			danger
			confirmText="封禁"
			onConfirm={ban}
		>
			<select
				value={duration}
				onChange={(e) => setDuration(e.target.value)}
				className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
			>
				<option value="7d">7 天</option>
				<option value="30d">30 天</option>
				<option value="permanent">永久</option>
			</select>
			<textarea
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				placeholder="封禁原因（审计留痕）"
				className="w-full rounded border border-ink-700 bg-ink-800 px-3 py-2"
			/>
		</ConfirmDialog>
	);
}
