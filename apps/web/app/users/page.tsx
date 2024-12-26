import { auth } from '@/libs/auth';
import { isAdmin } from '@/libs/checkPermission';
import { prisma } from '@repo/database';
import { Unauthorized } from '../globalComponents/Unauthorized';
import { UserTable } from './components/UserTable';

export default async function Users() {
	const session = await auth();
	if (!session || !isAdmin(session)) return Unauthorized();

	const users = await prisma.user.findMany();

	return (
		<UserTable
			myId={session.user.id}
			users={users.map((user) => ({
				...user,
				checked: false,
			}))}
		/>
	);
}
