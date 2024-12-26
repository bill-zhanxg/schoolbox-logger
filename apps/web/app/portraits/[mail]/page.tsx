import { PaginationMenu } from '@/app/globalComponents/PaginationMenu';
import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { getSignedUrlMap, stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { getXataClient } from '@/libs/xata';
import { Prisma } from '@prisma/client';
import { prisma } from '@repo/database';
import Image from 'next/image';

const xata = getXataClient();

export default async function PortraitHistory({
	params,
	searchParams,
}: {
	params: { mail: string };
	searchParams: SearchParams;
}) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 10;
	const { page } = stringifySearchParam(await searchParams);
	const filters: Prisma.PortraitsWhereInput = {
		mail: {
			contains: decodeURIComponent(params.mail),
		},
	};

	const total = await prisma.portraits.count({
		where: filters,
	});
	const portraits = await prisma.portraits.findMany({
		where: filters,
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			id: true,
			portrait: true,
			schoolbox_id: true,
			createdAt: true,
		},
		skip: page ? (parseInt(page) - 1) * pageSize : 0,
		take: pageSize,
	});

	// Transform the data to match the expected format in the template
	const portraitUrls = await getSignedUrlMap(portraits);

	return (
		<div className="flex w-full flex-col items-center gap-4 p-6">
			<div className="flex flex-col gap-4">
				<h1 className="text-center text-2xl font-bold">Portrait History for {decodeURIComponent(params.mail)}</h1>
				{portraits.map((portrait) => (
					<div key={portrait.id}>
						<h2 className="text-xl">
							Date: {dayjs.tz(portrait.createdAt, session.user.timezone ?? undefined).format('L LT')}
						</h2>
						<Image
							src={portrait.portrait ? (portraitUrls.get(portrait.portrait) ?? Portrait) : Portrait}
							alt={'Portrait'}
							width={500}
							height={1000}
						/>
					</div>
				))}
			</div>
			<PaginationMenu totalPages={Math.ceil(total / pageSize)} />
		</div>
	);
}
