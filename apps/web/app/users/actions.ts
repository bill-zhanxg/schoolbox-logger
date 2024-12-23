'use server';

import { auth } from '@/libs/auth';
import { isAdmin } from '@/libs/checkPermission';
import { getXataClient } from '@/libs/xata';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ChangeRoleState } from './components/UserTable';

const schema = z
	.object({
		users: z.string(),
		role: z.literal('blocked').or(z.literal('admin')).or(z.literal('view')),
	})
	.transform((data) => {
		const users = data.users.split(',').map((user) => user.trim());
		return { ...data, users };
	});

export async function changeRole(prevState: ChangeRoleState, formData: FormData): Promise<ChangeRoleState> {
	const session = await auth();
	if (!isAdmin(session)) return { success: false, message: 'Unauthorized' };

	const parse = schema.safeParse({
		users: formData.get('users'),
		role: formData.get('role'),
	});

	if (!parse.success) return { success: false, message: parse.error.message };

	const { users, role } = parse.data;

	return await getXataClient()
		.transactions.run(
			users.map((user) => ({
				update: {
					table: 'nextauth_users',
					id: user,
					fields: {
						role,
					},
				},
			})),
		)
		.then(() => {
			revalidatePath('/users');
			return { success: true, message: 'Success' };
		})
		.catch((error) => {
			return { success: false, message: error.message };
		});
}
