import { PaginationMenu } from '@/app/globalComponents/PaginationMenu';
import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { getXataClient } from '@/libs/xata';
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
	const { page } = stringifySearchParam(searchParams);
	const filters = {
		mail: {
			$iContains: params.mail,
		},
	};

	const total = (
		await xata.db.users.filter(filters).summarize({
			consistency: 'eventual',
			summaries: {
				total: { count: '*' },
			},
		})
	).summaries[0].total;
	const portraits = await xata.db.portraits
		.filter(filters)
		.sort('xata.createdAt', 'desc')
		.select(['portrait.signedUrl', 'schoolbox_id'])
		.getPaginated({
			consistency: 'eventual',
			pagination: {
				offset: page ? (parseInt(page) - 1) * pageSize : 0,
				size: pageSize,
			},
		});

	return (
		<div className="flex flex-col items-center gap-4 w-full p-6">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold text-center">Portrait History for {params.mail}</h1>
				{portraits.records.map((portrait) => (
					<div key={portrait.id}>
						<h2 className="text-xl">
							Date: {dayjs.tz(portrait.xata.createdAt, session.user.timezone ?? undefined).format('L LT')}
						</h2>
						<Image src={portrait.portrait?.signedUrl ?? Portrait} alt={'Portrait'} width={500} height={1000} />
					</div>
				))}
			</div>
			<PaginationMenu totalPages={Math.ceil(total / pageSize)} />
		</div>
	);
}
