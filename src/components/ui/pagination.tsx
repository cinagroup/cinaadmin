import { Button } from "@/components/ui/button";

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
		<div className="mt-4 flex items-center justify-between text-[14px] leading-5 text-body">
			<span>共 {total} 条</span>
			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={offset === 0}
					onClick={onPrev}
				>
					上一页
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={offset + pageSize >= total}
					onClick={onNext}
				>
					下一页
				</Button>
			</div>
		</div>
	);
}
