import { Session } from 'next-auth';

export function isAdmin(session: Session | null): boolean {
	return session?.user.role === 'admin';
}

export function isView(session: Session | null): boolean {
	return session?.user.role === 'view' || session?.user.role === 'admin';
}
