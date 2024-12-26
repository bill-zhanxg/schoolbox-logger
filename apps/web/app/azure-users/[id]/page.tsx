import { Box } from '@/app/globalComponents/Box';
import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { SideBySide } from '@/app/globalComponents/SideBySide';
import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { getSignedUrlMap, nullishToString } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { getXataClient } from '@/libs/xata';
import { prisma } from '@repo/database';
import Image from 'next/image';
import Link from 'next/link';

const xata = getXataClient();

export default async function User({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const session = await auth();
	if (!session) return null;

	const user = await prisma.azureUsers.findUnique({
		where: {
			id: parseInt(id, 10),
		},
	});
	if (!user) return <ErrorMessage code="404" message="User not found" />;

	const portrait = user.mail
		? await prisma.portraits.findFirst({
				where: {
					mail: {
						equals: user.mail,
						mode: 'insensitive',
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				select: {
					portrait: true,
					name: true,
					schoolbox_id: true,
				},
			})
		: undefined;

	const portraitUrl = await getSignedUrlMap(portrait);

	function formatTime(time: Date | null | undefined) {
		if (!time) return undefined;
		return dayjs.tz(time, session?.user.timezone ?? undefined).format('L LT');
	}

	return (
		<div className="flex w-full justify-center p-1 sm:p-6">
			<Box className="max-w-[80rem] flex-col gap-4 p-4 lg:p-8">
				<h1 className="text-center text-2xl font-bold">{user.displayName}</h1>
				<div className="flex flex-col justify-center gap-4 md:flex-row">
					<div className="w-full md:max-w-96">
						<Image
							src={portrait?.portrait ? (portraitUrl.get(portrait.portrait) ?? Portrait) : Portrait}
							alt={'Portrait'}
							width={1000}
							height={1000}
							className="w-full object-contain"
							placeholder={getShimmerImage(1000, 1000)}
							priority
						/>
						<Link href={`/portraits/${user.mail}`} className="btn btn-primary w-full rounded-t-none">
							View Portrait History
						</Link>
					</div>
					<div className="w-full max-w-[48rem]">
						<SideBySide title="Azure ID" value={nullishToString(user.id)} />
						<SideBySide title="Logged At" value={nullishToString(formatTime(user.createdAt))} />
						<SideBySide title="Schoolbox Name" value={nullishToString(portrait?.name)} />
						<SideBySide title="Schoolbox ID" value={nullishToString(portrait?.schoolbox_id)} />
						<SideBySide title="Display Name" value={nullishToString(user.displayName)} />
						<SideBySide title="First Name" value={nullishToString(user.givenName)} />
						<SideBySide title="Last Name" value={nullishToString(user.surname)} />
						<SideBySide title="Postal Code" value={nullishToString(user.postalCode)} />
						<SideBySide title="City" value={nullishToString(user.city)} />
						<SideBySide title="Mail" value={nullishToString(user.mail)} />
						<SideBySide title="Department" value={nullishToString(user.department)} />
						<SideBySide title="Mail Nickname" value={nullishToString(user.mailNickname)} />
						<SideBySide title="On Premises Sam Account Name" value={nullishToString(user.onPremisesSamAccountName)} />
						<SideBySide title="OPDN" value={nullishToString(user.onPremisesDistinguishedName)} />
						<SideBySide title="OP Sync Enabled" value={nullishToString(user.onPremisesSyncEnabled?.toString())} />
						<SideBySide
							title="OP Last Sync Date"
							value={nullishToString(formatTime(user.onPremisesLastSyncDateTime))}
						/>
						<SideBySide title="Business Phones" value={nullishToString(user.businessPhones?.join(', '))} />
						<SideBySide title="Mobile Phone" value={nullishToString(user.mobilePhone)} />
						<SideBySide title="Street Address" value={nullishToString(user.streetAddress)} />
						<SideBySide title="Age Group" value={nullishToString(user.ageGroup)} />
						<SideBySide
							title="Last Password Change Date"
							value={nullishToString(formatTime(user.lastPasswordChangeDateTime))}
						/>
						<SideBySide title="Account Enabled" value={nullishToString(user.accountEnabled?.toString())} />
						<SideBySide title="Created Date Time" value={nullishToString(formatTime(user.createdDateTime))} />
						<SideBySide title="User Type" value={nullishToString(user.userType)} />
					</div>
				</div>
			</Box>
			{/* TODO: history */}
		</div>
	);
}
