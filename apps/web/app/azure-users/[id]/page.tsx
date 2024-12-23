import { Box } from '@/app/globalComponents/Box';
import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { SideBySide } from '@/app/globalComponents/SideBySide';
import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { nullishToString } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { getXataClient } from '@/libs/xata';
import Image from 'next/image';
import Link from 'next/link';

const xata = getXataClient();

export default async function User({ params }: { params: { id: string } }) {
	const session = await auth();
	if (!session) return null;

	const user = await xata.db.users.read(params.id);
	if (!user) return <ErrorMessage code="404" message="User not found" />;
	const portrait = user.mail
		? await xata.db.portraits
				.filter({
					mail: {
						$iContains: user.mail,
					},
				})
				.sort('xata.createdAt', 'desc')
				.select(['portrait.signedUrl', 'name', 'schoolbox_id'])
				.getFirst()
		: undefined;

	function formatTime(time: Date | null | undefined) {
		if (!time) return undefined;
		return dayjs.tz(time, session?.user.timezone ?? undefined).format('L LT');
	}

	return (
		<div className="flex justify-center w-full p-1 sm:p-6">
			<Box className="flex-col gap-4 p-4 lg:p-8 max-w-[80rem]">
				<h1 className="text-2xl font-bold text-center">{user.displayName}</h1>
				<div className="flex flex-col md:flex-row justify-center gap-4">
					<div className="w-full md:max-w-96">
						<Image
							src={portrait?.portrait?.signedUrl ?? Portrait}
							alt={'Portrait'}
							width={1000}
							height={1000}
							className="object-contain w-full"
							placeholder={getShimmerImage(1000, 1000)}
							priority
						/>
						<Link href={`/portraits/${user.mail}`} className="btn rounded-t-none btn-primary w-full">
							View Portrait History
						</Link>
					</div>
					<div className="w-full max-w-[48rem]">
						<SideBySide title="Azure ID" value={nullishToString(user.id)} fontSize="" />
						<SideBySide title="Logged At" value={nullishToString(formatTime(user.xata.createdAt))} fontSize="" />
						<SideBySide title="Schoolbox Name" value={nullishToString(portrait?.name)} fontSize="" />
						<SideBySide title="Schoolbox ID" value={nullishToString(portrait?.schoolbox_id)} fontSize="" />
						<SideBySide title="Display Name" value={nullishToString(user.displayName)} fontSize="" />
						<SideBySide title="First Name" value={nullishToString(user.givenName)} fontSize="" />
						<SideBySide title="Last Name" value={nullishToString(user.surname)} fontSize="" />
						<SideBySide title="Postal Code" value={nullishToString(user.postalCode)} fontSize="" />
						<SideBySide title="City" value={nullishToString(user.city)} fontSize="" />
						<SideBySide title="Mail" value={nullishToString(user.mail)} fontSize="" />
						<SideBySide title="Department" value={nullishToString(user.department)} fontSize="" />
						<SideBySide title="Mail Nickname" value={nullishToString(user.mailNickname)} fontSize="" />
						<SideBySide
							title="On Premises Sam Account Name"
							value={nullishToString(user.onPremisesSamAccountName)}
							fontSize=""
						/>
						<SideBySide title="OPDN" value={nullishToString(user.onPremisesDistinguishedName)} fontSize="" />
						<SideBySide
							title="OP Sync Enabled"
							value={nullishToString(user.onPremisesSyncEnabled?.toString())}
							fontSize=""
						/>
						<SideBySide
							title="OP Last Sync Date"
							value={nullishToString(formatTime(user.onPremisesLastSyncDateTime))}
							fontSize=""
						/>
						<SideBySide title="Business Phones" value={nullishToString(user.businessPhones?.join(', '))} fontSize="" />
						<SideBySide title="Mobile Phone" value={nullishToString(user.mobilePhone)} fontSize="" />
						<SideBySide title="Street Address" value={nullishToString(user.streetAddress)} fontSize="" />
						<SideBySide title="Age Group" value={nullishToString(user.ageGroup)} fontSize="" />
						<SideBySide
							title="Last Password Change Date"
							value={nullishToString(formatTime(user.lastPasswordChangeDateTime))}
							fontSize=""
						/>
						<SideBySide title="Account Enabled" value={nullishToString(user.accountEnabled?.toString())} fontSize="" />
						<SideBySide
							title="Created Date Time"
							value={nullishToString(formatTime(user.createdDateTime))}
							fontSize=""
						/>
						<SideBySide title="User Type" value={nullishToString(user.userType)} fontSize="" />
					</div>
				</div>
			</Box>
			{/* TODO: history */}
		</div>
	);
}
