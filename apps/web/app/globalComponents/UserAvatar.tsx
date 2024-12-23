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
		<Image src={user.image} alt="User Avatar" height={500} width={500} className={`w-12 h-12 hover:shadow-lg shadow-cyan-500/50 ${className}`} priority />
	) : (
		<Image
			src={`https://icotar.com/${user.name ? 'initials' : 'avatar'}/${encodeURI(
				user.name ?? (user.email || user.id),
			)}.png`}
			width={500}
			height={500}
			alt="User Avatar"
			className={`w-12 h-12 hover:shadow-lg shadow-cyan-500/50 ${className}`}
			priority
		/>
	);
}
