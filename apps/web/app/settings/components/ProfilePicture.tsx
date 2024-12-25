'use client';

import { UserAvatar } from '@/app/globalComponents/UserAvatar';
import { useState } from 'react';
import { FaPen } from 'react-icons/fa6';

export function ProfilePicture({
	user,
}: {
	user: {
		id: string;
		name?: string | null | undefined;
		email?: string | null | undefined;
		image?: string | null | undefined;
	};
}) {
	const [userState, setUser] = useState(user);

	function toBase64(file: File) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
		});
	}

	return (
		<label
			htmlFor="avatar"
			className="avatar hover:cursor-pointer h-24 w-24 rounded-full ring-3 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden mt-2 backdrop-opacity-10 bg-white/30"
		>
			<UserAvatar user={userState} />
			<input
				type="file"
				id="avatar"
				name="avatar"
				accept="image/*"
				className="hidden"
				onChange={async (event) => {
					const file = event.target.files?.[0];
					if (!file) return;
					const base64 = (await toBase64(file)) as string;
					setUser((user) => {
						return {
							...user,
							image: base64,
						};
					});
				}}
			/>
			<span className="absolute bottom-0 right-0 bg-base-content/80 text-base-100 rounded-tl-full p-4 z-10"><FaPen /></span>
		</label>
	);
}
