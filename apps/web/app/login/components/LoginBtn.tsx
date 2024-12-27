'use client';

import { useState } from 'react';
import { FaMicrosoft } from 'react-icons/fa';

export function LoginBtn({ loginAction }: { loginAction: () => Promise<void> }) {
	const [loading, setLoading] = useState(false);

	return (
		<form className="w-4/5 max-w-[15rem]" action={loginAction} onSubmit={() => setLoading(true)}>
			<button type="submit" className="btn btn-primary w-full" disabled={loading}>
				{loading ? (
					<span className="loading loading-dots loading-lg"></span>
				) : (
					<span className="flex w-full items-center justify-between gap-4">
						<FaMicrosoft className="text-xl" />
						<p>Login with Microsoft</p>
					</span>
				)}
			</button>
		</form>
	);
}
