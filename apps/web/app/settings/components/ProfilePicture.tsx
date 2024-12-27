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
			className="avatar ring-primary ring-offset-base-100 mt-2 h-24 w-24 overflow-hidden rounded-full bg-white/30 ring-3 ring-offset-2 backdrop-opacity-10 hover:cursor-pointer"
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
			<span className="bg-base-content/80 text-base-100 absolute right-0 bottom-0 z-10 rounded-tl-full p-4">
				<FaPen />
			</span>
		</label>
	);
}
