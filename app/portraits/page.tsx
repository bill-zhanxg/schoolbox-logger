import { auth } from '@/libs/auth';
import { parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { PortraitsRecord, getXataClient } from '@/libs/xata';
import { Page, SelectedPick } from '@xata.io/client';
import { FilterComponent } from '../globalComponents/Filter';
import { PaginationMenu } from '../globalComponents/PaginationMenu';

const xata = getXataClient();

export default async function Portraits({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 100;
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
		| Page<PortraitsRecord, SelectedPick<PortraitsRecord, ('name' | 'mail' | 'portrait.signedUrl')[]>>
		| string =
		typeof filters === 'string'
			? filters
			: await xata.db.portraits
					.filter(filters)
					.select(['name', 'mail', 'portrait.signedUrl'])
					.getPaginated({
						consistency: 'eventual',
						pagination: {
							offset: page ? (parseInt(page) - 1) * pageSize : 0,
							size: pageSize,
						},
					})
					.catch((err) => err.message);

	return (
		<div className="sm:p-6">
			<h1 className="text-2xl font-bold text-center">Portraits</h1>
			<FilterComponent type="portrait" />
			{typeof data === 'string' ? <p>{data}</p> : <div className="overflow-x-auto"></div>}
			<PaginationMenu totalPages={Math.ceil(total / pageSize)} />
		</div>
	);
}
