import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { nullishToString, parseSearchParamsFilter, stringifySearchParam } from '@/libs/formatValue';
import { SearchParams } from '@/libs/types';
import { getXataClient } from '@/libs/xata';
import { prisma } from '@repo/database';
import Link from 'next/link';
import { FilterComponent } from '../globalComponents/Filter';
import { PaginationMenu } from '../globalComponents/PaginationMenu';
import { GlobalSearch } from '../globalComponents/Search';

const xata = getXataClient();

export default async function AzureUsersPage({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 50;
	const { page, search } = stringifySearchParam(await searchParams);
	const filters = parseSearchParamsFilter(await searchParams, 'azure-users');

	const total = await prisma.azureUsers.count({ where: typeof filters === 'string' ? undefined : filters });

	// TODO: full text search function
	const data =
		typeof filters === 'string'
			? filters
			: await prisma.azureUsers.findMany({
					where: filters,
					skip: page ? (parseInt(page) - 1) * pageSize : 0,
					take: pageSize,
				});

	return (
		<div className="sm:p-6">
			<h1 className="text-center text-2xl font-bold">Azure Users</h1>
			<GlobalSearch />
			<FilterComponent type="azure-users" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="mb-2 overflow-x-auto">
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
								{data.map((user) => (
									<tr key={user.id}>
										<td>
											<div>
												<div className="font-bold">{nullishToString(user.displayName)}</div>
												<div className="flex max-w-32 gap-1 overflow-hidden whitespace-nowrap lg:max-w-none">
													<span className="badge badge-ghost badge-sm rounded-xs px-0.5">
														{nullishToString(user.givenName)}
													</span>
													<span className="badge badge-ghost badge-sm rounded-xs px-0.5">
														{nullishToString(user.surname)}
													</span>
												</div>
											</div>
										</td>
										<td>{nullishToString(user.postalCode)}</td>
										<td>{nullishToString(user.city)}</td>
										<td>{nullishToString(user.mailNickname)}</td>
										<td>{nullishToString(user.department)}</td>
										<td>{user.accountEnabled?.toString() ?? '---'}</td>
										<td>
											{user.createdDateTime
												? dayjs.tz(user.createdDateTime, session.user.timezone ?? undefined).format('L LT')
												: '---'}
										</td>
										<td>{nullishToString(user.userType)}</td>
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
