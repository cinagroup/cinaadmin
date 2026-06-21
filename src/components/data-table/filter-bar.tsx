"use client";

import { useEffect, useState } from "react";

export interface FilterState {
	searchField?: string;
	searchValue?: string;
	[key: string]: unknown;
}

/**
 * Field-select + debounced search input. Fires `onChange` (debounced 350ms) so
 * the parent query refetches only after the user stops typing.
 */
export function FilterBar({
	fields,
	onChange,
	searchLabel = "搜索…",
}: {
	fields: { label: string; value: string }[];
	onChange: (f: FilterState) => void;
	searchLabel?: string;
}) {
	const [field, setField] = useState(fields[0]?.value ?? "email");
	const [value, setValue] = useState("");

	useEffect(() => {
		const t = setTimeout(() => onChange({ searchField: field, searchValue: value }), 350);
		return () => clearTimeout(t);
	}, [field, value, onChange]);

	return (
		<div className="mb-4 flex gap-2">
			<select
				value={field}
				onChange={(e) => setField(e.target.value)}
				className="rounded border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
			>
				{fields.map((f) => (
					<option key={f.value} value={f.value}>
						{f.label}
					</option>
				))}
			</select>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={searchLabel}
				className="flex-1 rounded border border-ink-700 bg-ink-800 px-3 py-2 text-sm"
			/>
		</div>
	);
}
