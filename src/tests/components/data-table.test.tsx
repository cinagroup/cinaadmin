import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	useReactTable,
	getCoreRowModel,
	type ColumnDef,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";

function Harness<T,>({
	data,
	columns,
	rowClassName,
}: {
	data: T[];
	columns: ColumnDef<T>[];
	rowClassName?: (row: T) => string | undefined;
}) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	return <DataTable table={table} rowClassName={rowClassName} />;
}

describe("DataTable", () => {
	it("renders header and rows", () => {
		const data = [{ a: "x" }, { a: "y" }];
		const cols: ColumnDef<{ a: string }>[] = [
			{ accessorKey: "a", header: "A" },
		];
		render(<Harness data={data} columns={cols} />);
		expect(screen.getByText("A")).toBeTruthy();
		expect(screen.getByText("x")).toBeTruthy();
		expect(screen.getByText("y")).toBeTruthy();
	});

	it("renders empty label when no rows", () => {
		const cols: ColumnDef<{ a: string }>[] = [{ accessorKey: "a", header: "A" }];
		render(<Harness data={[]} columns={cols} />);
		expect(screen.getByText("暂无数据")).toBeTruthy();
	});

	it("applies per-row className via rowClassName", () => {
		const data = [{ a: "x", bad: true }];
		const cols: ColumnDef<{ a: string; bad: boolean }>[] = [
			{ accessorKey: "a", header: "A" },
		];
		const { container } = render(
			<Harness
				data={data}
				columns={cols}
				rowClassName={(r) => (r.bad ? "row-danger" : undefined)}
			/>,
		);
		expect(container.querySelector("tbody tr")?.className).toContain("row-danger");
	});
});

describe("Badge", () => {
	it("renders children with the danger variant class", () => {
		const { container } = render(<Badge variant="danger">失败</Badge>);
		const span = container.querySelector("span");
		expect(span?.textContent).toBe("失败");
		expect(span?.className).toContain("danger");
	});
});
