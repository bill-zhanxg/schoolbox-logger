import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { UsersRecord, getXataClient } from '@/libs/xata';
import { Page, SelectedPick } from '@xata.io/client';
import Link from 'next/link';
import { FilterComponent } from '../globalComponents/Filter';
import { PaginationMenu } from '../globalComponents/PaginationMenu';

const xata = getXataClient();

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 50;
	const { page } = stringifySearchParam(searchParams);
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
			<FilterComponent type="azure-users" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="overflow-x-auto mb-2">
						<table className="table">
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
												<div className="font-bold">{user.displayName}</div>
												<div className="flex gap-1 max-w-32 lg:max-w-none whitespace-nowrap overflow-hidden">
													<span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.givenName}</span>
													<span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.surname}</span>
												</div>
											</div>
										</td>
										<td>{user.postalCode ?? '---'}</td>
										<td>{user.city ?? '---'}</td>
										<td>{user.mailNickname ?? '---'}</td>
										<td>{user.department ?? '---'}</td>
										<td>{user.accountEnabled?.toString() ?? '---'}</td>
										<td>
											{user.createdDateTime
												? dayjs.tz(user.createdDateTime, session.user.timezone ?? undefined).format('L LT')
												: '---'}
										</td>
										<td>{user.userType ?? '---'}</td>
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
