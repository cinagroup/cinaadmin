"use client";

import { useState, type ReactNode } from "react";

/**
 * Destructive-action confirmation dialog. `trigger` opens it; on confirm,
 * `onConfirm` runs. Supports an optional `children` body (e.g. form fields).
 */
export function ConfirmDialog({
	trigger,
	title,
	description,
	children,
	confirmText = "确认",
	danger,
	onConfirm,
}: {
	trigger: ReactNode;
	title: string;
	description?: string;
	children?: ReactNode;
	confirmText?: string;
	danger?: boolean;
	onConfirm: () => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<span
				onClick={(e) => {
					e.stopPropagation();
					setOpen(true);
				}}
				className="inline-flex cursor-pointer"
			>
				{trigger}
			</span>
			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
					onClick={() => setOpen(false)}
				>
					<div
						className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="font-serif text-lg text-gold-500">{title}</h3>
						{description && <p className="mt-2 text-sm text-muted">{description}</p>}
						{children && <div className="mt-3 space-y-3">{children}</div>}
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded border border-ink-700 px-3 py-1.5 text-sm"
							>
								取消
							</button>
							<button
								type="button"
								onClick={() => {
									onConfirm();
									setOpen(false);
								}}
								className={`rounded px-3 py-1.5 text-sm ${
									danger
										? "bg-danger text-white"
										: "bg-gold-500 text-ink-950"
								}`}
							>
								{confirmText}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
