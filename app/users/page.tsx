import { auth } from '@/libs/auth';
import { isAdmin } from '@/libs/checkPermission';
import { getXataClient } from '@/libs/xata';
import { Unauthorized } from '../globalComponents/Unauthorized';
import { UserTable } from './components/UserTable';

export default async function Users() {
	const session = await auth();
	if (!session || !isAdmin(session)) return Unauthorized();

	const users = await getXataClient().db.nextauth_users.select(['email', 'name', 'image', 'role']).getMany();

	return (
		<UserTable
			myId={session.user.id}
			users={users.toSerializable().map((user) => ({
				...user,
				checked: false,
			}))}
		/>
	);
}
