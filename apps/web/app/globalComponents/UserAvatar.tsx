import Image from 'next/image';

export function UserAvatar({
	user,
	className = '',
}: {
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
	className?: string;
}) {
	return user.image ? (
		<Image
			src={user.image}
			alt="User Avatar"
			height={500}
			width={500}
			className={`h-12 w-12 shadow-cyan-500/50 hover:shadow-lg ${className}`}
			priority
		/>
	) : (
		<Image
			src={`https://icotar.com/${user.name ? 'initials' : 'avatar'}/${encodeURI(
				user.name ?? (user.email || user.id),
			)}.png`}
			width={500}
			height={500}
			alt="User Avatar"
			className={`h-12 w-12 shadow-cyan-500/50 hover:shadow-lg ${className}`}
			priority
		/>
	);
}
