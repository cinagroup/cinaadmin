"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Destructive-action confirmation dialog (Radix-backed). `trigger` opens it;
 * on confirm, `onConfirm` runs. The trigger is wrapped via `asChild` so the
 * caller's own element receives the click — preserving the original API.
 *
 * Radix Dialog manages open state internally and closes on ESC, overlay click,
 * or any `DialogClose`-wrapped control. Both buttons here close the dialog.
 */
export function ConfirmDialog({
	trigger,
	title,
	description,
	children,
	confirmText,
	cancelText,
	danger,
	onConfirm,
}: {
	trigger: ReactNode;
	title: string;
	description?: string;
	children?: ReactNode;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
	onConfirm: () => void;
}) {
	const { t } = useI18n();
	const _confirmText = confirmText ?? t("common.confirm");
	const _cancelText = cancelText ?? t("common.cancel");
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button type="button" className="inline-flex cursor-pointer items-center">
					{trigger}
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children && <div className="space-y-3">{children}</div>}
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary" size="sm">
							{_cancelText}
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button
							type="button"
							variant={danger ? "danger" : "primary"}
							size="sm"
							onClick={() => {
								// Handlers are often async; a network-level failure rejects
								// without ever reaching their r.ok branches. Surface it here
								// so no confirmed action can fail with zero feedback.
								void Promise.resolve(onConfirm()).catch(() =>
									toast.error(t("toast.actionFailed")),
								);
							}}
						>
							{_confirmText}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
