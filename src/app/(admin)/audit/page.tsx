"use client";

import { useTranslation } from "react-i18next";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AuditPage() {
	const { t } = useTranslation();
	return <ModulePlaceholder label={t("nav.auditLog")} />;
}
