import { stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { UsersRecord, getXataClient } from '@/libs/xata';
import { PageRecordArray, SelectedPick } from '@xata.io/client';
import { z } from 'zod';
import { FilterComponent } from './components/Filter';
import { azureUserColumns } from './types';

const xata = getXataClient();

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const filters = parseSearchParamsFilter(searchParams);

	const data: PageRecordArray<Readonly<SelectedPick<UsersRecord, ['*']>>> | string =
		typeof filters === 'string'
			? filters
			: await getXataClient()
					.db.users.filter(filters)
					.getMany()
					.catch((err) => err.message);

	return (
		<div className="p-6">
			<h1>data</h1>
			<FilterComponent />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				data.map((user) => (
					<div key={user.id}>
						<h2>{user.displayName}</h2>
						<p>{user.mail}</p>
						{/* {portriats.map((portrait) => (
							<div key={portrait.id}>
								<p>{portrait.schoolbox_id}</p>
								<img src={'data:image/png;base64,' + portrait.portrait?.base64Content} />
							</div>
						))} */}
					</div>
				))
			)}
		</div>
	);
}

const ParseFilterSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		operator: z.string(),
		parentOperator: z.string(),
		value: z.string(),
	}),
);
type ParseFilters = z.infer<typeof ParseFilterSchema>;

/**
 * If return string, it's an error message, make sure to handle error if pass straight the filter function
 */
function parseSearchParamsFilter(searchParams: SearchParams) {
	try {
		const filters = stringifySearchParam(searchParams).filter;
		if (!filters) return undefined;
		const filterObject = ParseFilterSchema.safeParse(JSON.parse(filters));
		if (!filterObject.success) return 'Invalid filter object';
		let allFilters: ParseFilters = filterObject.data.filter((filter) => filter.parentOperator === 'and');
		let anyFilters: ParseFilters = filterObject.data.filter((filter) => filter.parentOperator === 'or');
		const getFilterColumn = (filter: ParseFilters[number]) => {
			const operator = '$' + filter.operator;
			const type = azureUserColumns.find((column) => column.name === filter.name)?.type;
			if (!type || !filter.value) return {};
			if (operator === '$exists' || operator === '$notExists') return { [operator]: filter.name };
			const getFilterValue = () => {
				if (type === 'bool') return filter.value === 'true' ? true : filter.value === 'false' ? false : undefined;
				if (type === 'datetime') return new Date(filter.value);
				return filter.value;
			};
			return {
				[filter.name]: {
					[operator]: getFilterValue(),
				},
			};
		};
		const newFilters = {
			$all: allFilters.map((filter) => getFilterColumn(filter)),
			$any: anyFilters.map((filter) => getFilterColumn(filter)),
		};
		return newFilters;
	} catch (error) {
		return [];
	}
}
