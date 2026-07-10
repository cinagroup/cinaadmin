import { cookies } from "next/headers";
import { getUser } from "@/lib/cinaauth/admin-api";
import { translate, DEFAULT_LANG } from "@/lib/i18n/dictionary";
import { UserTabs } from "./user-tabs";
import { UserActions } from "./user-actions";
import { PageHeader } from "@/components/layout/page-header";

export default async function UserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const cookie = (await cookies()).toString();
	const user = await getUser(cookie, id).catch(() => null);

	if (!user) {
		return (
			<div>
				<PageHeader
					title={translate(DEFAULT_LANG, "users.notFound")}
					backHref="/users"
					backLabel={translate(DEFAULT_LANG, "users.back")}
				/>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title={user.email}
				backHref="/users"
				backLabel={translate(DEFAULT_LANG, "users.back")}
			>
				<UserActions userId={id} banned={user.banned} />
			</PageHeader>
			<UserTabs user={user} />
		</div>
	);
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
