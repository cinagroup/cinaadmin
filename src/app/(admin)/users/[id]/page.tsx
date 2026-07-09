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
		return (
			<div>
				<Link
					href="/users"
					className="text-[14px] leading-5 text-body hover:text-ink"
				>
					← 返回列表
				</Link>
				<p className="mt-4 text-[16px] leading-6 text-body">用户不存在或加载失败</p>
			</div>
		);
	}

	return (
		<div>
			<Link
				href="/users"
				className="text-[14px] leading-5 text-body hover:text-ink"
			>
				← 返回列表
			</Link>
			<div className="mt-2 flex items-center justify-between">
				<h1 className="text-[24px] font-semibold leading-8 tracking-[-0.96px] text-ink">
					{user.email}
				</h1>
				<UserActions userId={id} banned={user.banned} />
			</div>
			<UserTabs user={user} />
		</div>
	);
}

// Required by Cloudflare Pages (@cloudflare/next-on-pages).
export const runtime = "edge";
