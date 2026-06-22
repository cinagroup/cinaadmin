"use client";

import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
			<Select value={field} onValueChange={setField}>
				<SelectTrigger className="h-10 w-[140px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{fields.map((f) => (
						<SelectItem key={f.value} value={f.value}>
							{f.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={searchLabel}
				className="flex-1"
			/>
		</div>
	);
}
