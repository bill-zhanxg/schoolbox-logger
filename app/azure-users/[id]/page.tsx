import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { getXataClient } from '@/libs/xata';

const xata = getXataClient();

export default async function User({ params }: { params: { id: string } }) {
	const session = await auth();
	if (!session) return null;

	const user = await xata.db.users.read(params.id);
	if (!user) return <ErrorMessage code="404" message="User not found" />;
	const portraits = await xata.db.portraits
		.filter({
			mail: {
				$iContains: user.mail ?? undefined,
			},
		})
		.sort('xata.createdAt', 'desc')
		.select(['portrait.signedUrl', 'schoolbox_id'])
		.getFirst();

	console.log(portraits);

	return (
		<div>
			<h1>{user.displayName}</h1>
			<div>
				<div>
					<div className="font-bold">{user.displayName}</div>
					<div className="flex gap-1">
						<span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.givenName}</span>
						<span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.surname}</span>
					</div>
				</div>
			</div>
			<div>{user.postalCode ?? '---'}</div>
			<div>{user.city ?? '---'}</div>
			<div>{user.mailNickname ?? '---'}</div>
			<div>{user.department ?? '---'}</div>
			<div>{user.accountEnabled?.toString() ?? '---'}</div>
			<div>
				{user.createdDateTime
					? dayjs.tz(user.createdDateTime, session.user.timezone ?? undefined).format('L LT')
					: '---'}
			</div>
			<div>{user.userType ?? '---'}</div>
		</div>
	);
}
