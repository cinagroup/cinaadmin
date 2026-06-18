import { useTranslation } from "react-i18next";

/**
 * Placeholder for a Phase 2/3 module page. Reused for the 7 nav routes until
 * their real implementations land.
 */
export function ModulePlaceholder({ label }: { label: string }) {
	const { t } = useTranslation();
	return (
		<div>
			<h1 className="font-serif text-xl text-gold-500">{label}</h1>
			<p className="mt-2 text-sm text-muted">{t("placeholder.phase2")}</p>
		</div>
	);
}
