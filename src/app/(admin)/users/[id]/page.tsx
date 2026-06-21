import { cookies } from "next/headers";
import Link from "next/link";
import { getUser } from "@/lib/cinaauth/admin-api";
import { UserTabs } from "./user-tabs";

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
			<h1 className="mt-2 font-serif text-xl text-gold-500">{user.email}</h1>
			<UserTabs userId={id} />
		</div>
	);
}
