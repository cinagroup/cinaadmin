"use client";

import { flexRender, type Table } from "@tanstack/react-table";

/**
 * Generic table renderer built on @tanstack/react-table. The caller constructs
 * the table instance (columns + data) and passes it in. Optional `rowClassName`
 * supports per-row highlighting (e.g. audit failure rows).
 */
export function DataTable<T>({
	table,
	rowClassName,
	emptyLabel = "暂无数据",
}: {
	table: Table<T>;
	rowClassName?: (row: T) => string | undefined;
	emptyLabel?: string;
}) {
	if (table.getRowModel().rows.length === 0) {
		return (
			<div className="rounded-lg border border-ink-700 p-8 text-center text-sm text-muted">
				{emptyLabel}
			</div>
		);
	}
	return (
		<div className="overflow-hidden rounded-lg border border-ink-700">
			<table className="w-full text-sm">
				<thead className="bg-ink-800 text-muted">
					{table.getHeaderGroups().map((hg) => (
						<tr key={hg.id}>
							{hg.headers.map((h) => (
								<th
									key={h.id}
									className="px-4 py-3 text-left font-medium whitespace-nowrap"
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
							className={`border-t border-ink-700 hover:bg-ink-800/50 ${
								rowClassName?.(row.original) ?? ""
							}`}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-4 py-3">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
