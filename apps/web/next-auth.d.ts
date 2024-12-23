import { DefaultSession } from 'next-auth';

type role = 'admin' | 'view' | null;
type team = { id: string };

interface CustomUser {
	/** The role of the user. */
	id: string;
	role?: role | null;
	timezone?: string | null;
	auto_timezone?: boolean | null;
}
declare module 'next-auth' {
	interface Session {
		user: CustomUser & DefaultSession['user'];
	}

	interface User extends DefaultUser, CustomUser {}
}

declare module '@auth/core/adapters' {
	interface AdapterUser extends BaseAdapterUser, CustomUser {}
}
