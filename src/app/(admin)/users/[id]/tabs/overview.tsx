"use client";

export function OverviewTab({ userId }: { userId: string }) {
	return (
		<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
			<dt className="whitespace-nowrap text-muted">用户 ID</dt>
			<dd className="break-all font-mono text-xs">{userId}</dd>
			<dt className="whitespace-nowrap text-muted">完整详情</dt>
			<dd className="text-xs text-muted">
				（Phase 3 接入 getUser 详情代理后展示邮箱 / 角色 / 2FA / 封禁状态 / 注册来源站点）
			</dd>
		</dl>
	);
}
