/**
 * Small KPI card. Label in the mono caption-eyebrow voice, value set in the
 * display scale (DESIGN.md `display-md` weight 600 ink).
 */
export function StatCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: number | string;
	hint?: string;
}) {
	return (
		<div className="rounded-[var(--radius-md)] bg-canvas p-5 shadow-[0_0_0_1px_#00000014_inset,0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
			<div className="font-mono text-[12px] uppercase tracking-wide text-mute">
				{label}
			</div>
			<div className="mt-2 text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
				{value}
			</div>
			{hint && <div className="mt-1 text-[12px] leading-4 text-mute">{hint}</div>}
		</div>
	);
}
