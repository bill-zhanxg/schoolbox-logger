import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { getSignedUrlMap, nullishToString, parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { SearchParams } from '@/libs/types';
import { prisma } from '@repo/database';
import Image from 'next/image';
import Link from 'next/link';
import { FilterComponent } from '../globalComponents/Filter';
import { PaginationMenu } from '../globalComponents/PaginationMenu';

export default async function Portraits({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 30;
	const { page } = stringifySearchParam(await searchParams);
	const filters = parseSearchParamsFilter(await searchParams, 'portrait');

	const total = await prisma.portraits.count({ where: typeof filters === 'string' ? undefined : filters });

	const data =
		typeof filters === 'string'
			? filters
			: await prisma.portraits.findMany({
					where: filters,
					skip: page ? (parseInt(page) - 1) * pageSize : 0,
					take: pageSize,
				});

	const portraitUrls = await getSignedUrlMap(data);

	function formatTime(time: Date | null | undefined) {
		if (!time) return undefined;
		return dayjs.tz(time, session?.user.timezone ?? undefined).format('L LT');
	}

	return (
		<div className="sm:p-6">
			<h1 className="text-center text-2xl font-bold">Portraits</h1>
			<FilterComponent type="portrait" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="card-grid-template mb-4 grid justify-items-center gap-6">
						{data.map((portrait) => (
							<div key={portrait.id} className="card bg-base-100 w-96 shadow-xl">
								<figure>
									<Image
										src={portrait.portrait ? (portraitUrls.get(portrait.portrait) ?? Portrait) : Portrait}
										alt={'Portrait'}
										width={1000}
										height={1000}
										className="w-full object-contain"
										placeholder={getShimmerImage(1000, 1000)}
										priority
									/>
								</figure>
								<div className="card-body gap-0 py-4">
									<h2 className="card-title">{nullishToString(portrait.name)}</h2>
									<p>{nullishToString(portrait.mail)}</p>
									<p>{nullishToString(formatTime(portrait.createdAt))}</p>
									<div className="card-actions justify-end">
										<Link href={`/portraits/${portrait.mail}`} className="btn btn-sm w-full">
											View History
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
					<PaginationMenu totalPages={Math.ceil(total / pageSize)} />
				</>
			)}
		</div>
	);
}
