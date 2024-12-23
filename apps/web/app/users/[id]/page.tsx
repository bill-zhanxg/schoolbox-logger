import { Box } from '@/app/globalComponents/Box';
import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { Unauthorized } from '@/app/globalComponents/Unauthorized';
import { UserAvatar } from '@/app/globalComponents/UserAvatar';
import { auth } from '@/libs/auth';
import { isAdmin } from '@/libs/checkPermission';
import { getXataClient } from '@/libs/xata';

export default async function User({
	params,
}: {
	params: {
		id: string;
	};
}) {
	const session = await auth();
	const user = await getXataClient().db.nextauth_users.read(params.id, ['email', 'name', 'image', 'role']);
	if (!user) return <ErrorMessage code="404" message="The user you're looking for can not be found" />;

	if (!isAdmin(session) && user.role !== 'teacher' && user.role !== 'admin') return Unauthorized();

	return (
		<div className="flex justify-center items-center h-[80vh] w-full">
			<Box className="card card-side bg-base-100 shadow-xl w-auto p-0 sm:px-8 sm:py-2 max-w-xl">
				<div className="card-body">
					<div className="flex flex-col sm:flex-row gap-6 items-center break-all">
						<div className="avatar">
							<div className="w-24 rounded-full avatar h-24 ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden mt-2 backdrop-opacity-10 bg-white/30">
								<UserAvatar user={user} />
							</div>
						</div>
						<div className="flex flex-col gap-1 justify-center">
							<h2 className="text-4xl">{user.name}</h2>
							<h3 className="text-xl">{user.email}</h3>
							<div className="badge badge-primary gap-2 capitalize rounded-md">{user.role}</div>
						</div>
					</div>
				</div>
			</Box>
		</div>
	);
}
