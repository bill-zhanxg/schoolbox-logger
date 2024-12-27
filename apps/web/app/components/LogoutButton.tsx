'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
	return (
		<button
			id="logout-btn"
			className="bg-red-600 text-white hover:bg-red-800"
			onClick={(e) => {
				e.preventDefault();
				signOut({
					callbackUrl: '/login',
				});
			}}
		>
			Logout
		</button>
	);
}
