import { auth } from '@/libs/auth';
import { Box } from '../globalComponents/Box';
import { Unauthorized } from '../globalComponents/Unauthorized';
import { UserAvatar } from '../globalComponents/UserAvatar';
import { SettingsForm } from './components/SettingsForm';

export default async function Profile() {
	const session = await auth();
	if (!session) return Unauthorized();

	return (
		<div className="flex w-full justify-center">
			<div className="m-4 flex w-full max-w-[50rem] flex-col gap-8">
				<Box className="flex-row items-center p-2">
					<div className="avatar p-4">
						<div className="avatar ring-primary ring-offset-base-100 w-16 rounded-full ring-3 ring-offset-2">
							<UserAvatar user={session.user} />
						</div>
					</div>
					<div>
						<h1 className="font-bold">{session.user.name}</h1>
						<p>{session.user.email}</p>
					</div>
				</Box>
				<SettingsForm session={session} />
			</div>
		</div>
	);
}
