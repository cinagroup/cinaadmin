import { cookies } from "next/headers";
import Link from "next/link";
import { getUser } from "@/lib/cinaauth/admin-api";
import { UserTabs } from "./user-tabs";
import { UserActions } from "./user-actions";

export default async function UserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const cookie = (await cookies()).toString();
	const user = await getUser(cookie, id).catch(() => null);

	if (!user) {
		return <div className="text-muted">用户不存在或加载失败</div>;
	}

	return (
		<div>
			<Link href="/users" className="text-sm text-muted">
				← 返回列表
			</Link>
			<div className="mt-2 flex items-center justify-between">
				<h1 className="font-serif text-xl text-gold-500">{user.email}</h1>
				<UserActions userId={id} banned={user.banned} />
			</div>
			<UserTabs userId={id} />
		</div>
	);
}
