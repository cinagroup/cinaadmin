"use client";

import { flexRender, type Table } from "@tanstack/react-table";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Generic table renderer built on @tanstack/react-table. The caller constructs
 * the table instance (columns + data) and passes it in. Optional `rowClassName`
 * supports per-row highlighting (e.g. audit failure rows).
 *
 * Header typography uses the mono caption eyebrow voice (DESIGN.md
 * `ex-data-table-cell`); rows sit on canvas with hairline dividers.
 */
export function DataTable<T>({
	table,
	rowClassName,
	emptyLabel,
}: {
	table: Table<T>;
	rowClassName?: (row: T) => string | undefined;
	emptyLabel?: string;
}) {
	const { t } = useI18n();
	if (table.getRowModel().rows.length === 0) {
		return (
			<div className="rounded-[var(--radius-md)] bg-canvas-soft p-8 text-center text-[14px] leading-5 text-mute">
				{emptyLabel ?? t("common.noData")}
			</div>
		);
	}
	return (
		<div className="overflow-hidden rounded-[var(--radius-md)] border border-hairline bg-canvas">
			<table className="w-full">
				<thead className="bg-canvas-soft">
					{table.getHeaderGroups().map((hg) => (
						<tr key={hg.id} className="border-b border-hairline">
							{hg.headers.map((h) => (
								<th
									key={h.id}
									className="px-3 py-2 text-left font-mono text-[12px] font-normal uppercase tracking-wide whitespace-nowrap text-mute"
								>
									{h.isPlaceholder
										? null
										: flexRender(
												h.column.columnDef.header,
												h.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className={cn(
								"border-b border-hairline last:border-b-0 transition-colors hover:bg-canvas-soft",
								rowClassName?.(row.original),
							)}
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className="px-3 py-2.5 text-[14px] leading-5 text-ink"
								>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext(),
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
