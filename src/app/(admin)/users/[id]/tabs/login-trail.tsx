"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { AuditLogDTO } from "@/lib/cinaauth/dto";

/**
 * Login history as a vertical timeline. Each event is a node (accent dot for
 * success, error dot for failure) with timestamp / IP / device on the right.
 * Data source is unchanged: audit log filtered by action=user.login.
 */
export function LoginTrailTab({ userId }: { userId: string }) {
	const { data, isFetching } = useQuery({
		queryKey: ["user", userId, "login-trail"],
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: "50",
				action: "user.login",
				targetId: userId,
			});
			const r = await fetch(`/api/admin/audit?${params}`);
			const d = (await r.json()) as {
				ok: boolean;
				data?: { rows: AuditLogDTO[] };
			};
			return d.ok ? d.data?.rows ?? [] : [];
		},
	});

	const rows = data ?? [];

	if (isFetching) {
		return (
			<EmptyState>
				<div className="text-[14px] leading-5 text-mute">加载中…</div>
			</EmptyState>
		);
	}
	if (rows.length === 0) {
		return <EmptyState>无登录记录</EmptyState>;
	}

	return (
		<ol className="relative space-y-5 border-l border-hairline pl-6">
			{rows.map((row, i) => {
				const failed = row.result === "failure";
				return (
					<li key={`${row.timestamp}-${i}`} className="relative">
						{/* Timeline node */}
						<span
							className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ${
								failed
									? "bg-[var(--error-soft)] text-error"
									: "bg-[var(--success-soft)] text-accent"
							}`}
						>
							{failed ? (
								<XCircle size={12} />
							) : (
								<CheckCircle2 size={12} />
							)}
						</span>
						<div
							className={`rounded-[var(--radius-sm)] border border-hairline bg-canvas px-4 py-3 ${
								failed ? "border-[var(--error-soft)]" : ""
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="text-[14px] font-medium leading-5 text-ink">
									{failed ? "登录失败" : "登录成功"}
								</div>
								<div className="font-mono text-[12px] leading-4 text-mute">
									{new Date(row.timestamp).toLocaleString()}
								</div>
							</div>
							<div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[13px] leading-5 text-body">
								{row.actorIp && (
									<span>
										<span className="text-mute">IP：</span>
										{row.actorIp}
									</span>
								)}
								{row.actorUa && (
									<span className="max-w-md truncate">
										<span className="text-mute">设备：</span>
										{row.actorUa}
									</span>
								)}
							</div>
						</div>
					</li>
				);
			})}
		</ol>
	);
}
