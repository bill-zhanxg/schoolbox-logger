import { Box } from '@/app/globalComponents/Box';
import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { Unauthorized } from '@/app/globalComponents/Unauthorized';
import { UserAvatar } from '@/app/globalComponents/UserAvatar';
import { auth } from '@/libs/auth';
import { isAdmin } from '@/libs/checkPermission';
import { prisma } from '@repo/database';

export default async function User({
	params,
}: {
	params: Promise<{
		id: string;
	}>;
}) {
	const session = await auth();
	const user = await prisma.user.findUnique({
		where: { id: (await params).id },
	});
	if (!user) return <ErrorMessage code="404" message="The user you're looking for can not be found" />;

	if (!isAdmin(session)) return Unauthorized();

	return (
		<div className="flex h-[80vh] w-full items-center justify-center">
			<Box className="card card-side bg-base-100 w-auto max-w-xl p-0 shadow-xl sm:px-8 sm:py-2">
				<div className="card-body">
					<div className="flex flex-col items-center gap-6 break-all sm:flex-row">
						<div className="avatar">
							<div className="avatar ring-primary ring-offset-base-100 mt-2 h-24 w-24 overflow-hidden rounded-full bg-white/30 ring-3 ring-offset-2 backdrop-opacity-10">
								<UserAvatar user={user} />
							</div>
						</div>
						<div className="flex flex-col justify-center gap-1">
							<h2 className="text-4xl">{user.name}</h2>
							<h3 className="text-xl">{user.email}</h3>
							<div className="badge badge-primary gap-2 rounded-md capitalize">{user.role}</div>
						</div>
					</div>
				</div>
			</Box>
		</div>
	);
}
