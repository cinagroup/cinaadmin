"use client";

import { useTranslation } from "react-i18next";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function OrganizationsPage() {
	const { t } = useTranslation();
	return <ModulePlaceholder label={t("nav.organizations")} />;
}
