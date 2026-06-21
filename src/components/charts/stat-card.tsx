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
		<div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
			<div className="text-xs uppercase tracking-wide text-muted">{label}</div>
			<div className="mt-2 font-serif text-3xl text-gold-500">{value}</div>
			{hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
		</div>
	);
}
