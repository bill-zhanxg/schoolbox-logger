import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { nullishToString, parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { UsersRecord, getXataClient } from '@/libs/xata';
import { Page, SelectedPick } from '@xata.io/client';
import Link from 'next/link';
import { FilterComponent } from '../globalComponents/Filter';
import { GlobalSearch } from '../globalComponents/Search';
import { PaginationMenu } from '../globalComponents/PaginationMenu';

const xata = getXataClient();

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 50;
	const { page, search } = stringifySearchParam(searchParams);
	const filters = parseSearchParamsFilter(searchParams, 'azure-users');

	const total = (
		await xata.db.users
			.filter(filters)
			.summarize({
				consistency: 'eventual',
				summaries: {
					total: { count: '*' },
				},
			})
			.catch(() => ({ summaries: [{ total: 0 }] }))
	).summaries[0].total;
	const data: Page<UsersRecord, Readonly<SelectedPick<UsersRecord, ['*']>>> | string =
		typeof filters === 'string'
			? filters
			: search
			? await xata.search
					.all(search, {
						tables: [
							{
								table: 'users',
								filter: filters,
							},
						],
					})
					.then((res) => ({
						records: res.records.map((record) => record.record),
					}))
					.catch((err) => err.message)
			: await xata.db.users
					.filter(filters)
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
			<h1 className="text-2xl font-bold text-center">Azure Users</h1>
			<GlobalSearch />
			<FilterComponent type="azure-users" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="overflow-x-auto mb-2">
						<table className="table [&_em]:bg-yellow-300">
							{/* head */}
							<thead>
								<tr>
									<th>Name</th>
									<th>postalCode</th>
									<th>city</th>
									<th>mailNickname</th>
									<th>department</th>
									<th>accountEnabled</th>
									<th>createdDateTime</th>
									<th>userType</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{data.records.map((user) => (
									<tr key={user.id}>
										<td>
											<div>
												<div className="font-bold">
													<GetTdChildren user={user} objKey="displayName" />
												</div>
												<div className="flex gap-1 max-w-32 lg:max-w-none whitespace-nowrap overflow-hidden">
													<span className="badge badge-ghost badge-sm rounded-sm px-0.5">
														<GetTdChildren user={user} objKey="givenName" />
													</span>
													<span className="badge badge-ghost badge-sm rounded-sm px-0.5">
														<GetTdChildren user={user} objKey="surname" />
													</span>
												</div>
											</div>
										</td>
										<td>{<GetTdChildren user={user} objKey="postalCode" />}</td>
										<td>{<GetTdChildren user={user} objKey="city" />}</td>
										<td>{<GetTdChildren user={user} objKey="mailNickname" />}</td>
										<td>{<GetTdChildren user={user} objKey="department" />}</td>
										<td>{user.accountEnabled?.toString() ?? '---'}</td>
										<td>
											{user.createdDateTime
												? dayjs.tz(user.createdDateTime, session.user.timezone ?? undefined).format('L LT')
												: '---'}
										</td>
										<td>{<GetTdChildren user={user} objKey="userType" />}</td>
										<th>
											<Link href={`/azure-users/${user.id}`} className="btn btn-ghost btn-xs">
												details
											</Link>
										</th>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<PaginationMenu totalPages={Math.ceil(total / pageSize)} />
				</>
			)}
		</div>
	);
}

function GetTdChildren({
	user,
	objKey,
}: {
	user: Readonly<SelectedPick<UsersRecord, ['*']>>;
	objKey: keyof Readonly<SelectedPick<UsersRecord, ['*']>>;
}) {
	return (user.xata as any).highlight?.[objKey] ? (
		<span
			dangerouslySetInnerHTML={{
				__html: (user.xata as any).highlight[objKey],
			}}
		/>
	) : (
		nullishToString(user[objKey] as any)
	);
}
