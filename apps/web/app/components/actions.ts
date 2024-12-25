'use server';
import { auth } from '@/libs/auth';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function setUserTimezone(timezone: string) {
	if (!timezone || typeof timezone !== 'string') return;

	const session = await auth();
	if (!session || session.user.timezone === timezone) return;
	await prisma.user.update({ where: { id: session.user.id }, data: { timezone } });

	// Revalidate all data
	revalidatePath('/', 'layout');
}
