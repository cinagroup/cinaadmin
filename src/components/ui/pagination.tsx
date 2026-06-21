/** Prev/next pager. Caller owns offset state. */
export function Pagination({
	offset,
	pageSize,
	total,
	onPrev,
	onNext,
}: {
	offset: number;
	pageSize: number;
	total: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="mt-4 flex items-center justify-between text-sm text-muted">
			<span>共 {total} 条</span>
			<div className="flex gap-2">
				<button
					type="button"
					disabled={offset === 0}
					onClick={onPrev}
					className="rounded border border-ink-700 px-3 py-1 disabled:opacity-30"
				>
					上一页
				</button>
				<button
					type="button"
					disabled={offset + pageSize >= total}
					onClick={onNext}
					className="rounded border border-ink-700 px-3 py-1 disabled:opacity-30"
				>
					下一页
				</button>
			</div>
		</div>
	);
}
