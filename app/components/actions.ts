'use server';

import { auth } from '@/libs/auth';
import { getXataClient } from '@/libs/xata';

export async function setUserTimezone(timezone: string): Promise<boolean> {
	if (!timezone || typeof timezone !== 'string') return false;

	const session = await auth();
	if (!session || session.user.timezone === timezone) return false;

	await getXataClient().db.nextauth_users.update(session.user.id, { timezone });

	return true;
}
