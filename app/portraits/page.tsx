import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { nullishToString, parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { SearchParams } from '@/libs/types';
import { PortraitsRecord, getXataClient } from '@/libs/xata';
import { Page, SelectedPick } from '@xata.io/client';
import Image from 'next/image';
import Link from 'next/link';
import { FilterComponent } from '../globalComponents/Filter';
import { PaginationMenu } from '../globalComponents/PaginationMenu';

const xata = getXataClient();

export default async function Portraits({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 30;
	const { page } = stringifySearchParam(searchParams);
	const filters = parseSearchParamsFilter(searchParams, 'portrait');

	const total = (
		await xata.db.portraits
			.filter(filters)
			.summarize({
				consistency: 'eventual',
				summaries: {
					total: { count: '*' },
				},
			})
			.catch(() => ({ summaries: [{ total: 0 }] }))
	).summaries[0].total;
	const data:
		| Page<
				PortraitsRecord,
				SelectedPick<PortraitsRecord, ('name' | 'mail' | 'xata.createdAt' | 'portrait.signedUrl')[]>
		  >
		| string =
		typeof filters === 'string'
			? filters
			: await xata.db.portraits
					.filter(filters)
					.select(['name', 'mail', 'xata.createdAt', 'portrait.signedUrl'])
					.getPaginated({
						consistency: 'eventual',
						pagination: {
							offset: page ? (parseInt(page) - 1) * pageSize : 0,
							size: pageSize,
						},
					})
					.catch((err) => err.message);

	function formatTime(time: Date | null | undefined) {
		if (!time) return undefined;
		return dayjs.tz(time, session?.user.timezone ?? undefined).format('L LT');
	}

	return (
		<div className="sm:p-6">
			<h1 className="text-2xl font-bold text-center">Portraits</h1>
			<FilterComponent type="portrait" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="grid card-grid-template justify-items-center gap-6 mb-4">
						{data.records.map((portrait) => (
							<div key={portrait.id} className="card w-96 bg-base-100 shadow-xl">
								<figure>
									<Image
										src={portrait?.portrait?.signedUrl ?? Portrait}
										alt={'Portrait'}
										width={1000}
										height={1000}
										className="object-contain w-full"
										placeholder={getShimmerImage(1000, 1000)}
										priority
									/>
								</figure>
								<div className="card-body gap-0 py-4">
									<h2 className="card-title">{nullishToString(portrait.name)}</h2>
									<p>{nullishToString(portrait.mail)}</p>
									<p>{nullishToString(formatTime(portrait.xata.createdAt))}</p>
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
