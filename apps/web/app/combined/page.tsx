import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { getSignedUrlMap, nullishToString, stringifySearchParam } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { SearchParams } from '@/libs/types';
import { getUserAndPortrait } from '@prisma/client/sql';
import { prisma } from '@repo/database';
import Image from 'next/image';
import Link from 'next/link';
import { PaginationMenu } from '../globalComponents/PaginationMenu';
import { GlobalSearch } from '../globalComponents/Search';

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 50;
	const { page, search } = stringifySearchParam(await searchParams);

	const data = await prisma.$queryRawTyped(
		getUserAndPortrait(pageSize, Math.max(1, page ? (parseInt(page) - 1) * pageSize : 0), search || ''),
	);
	const total = Number(data[0]?.total_count ?? 0);
	const portraitUrls = await getSignedUrlMap(data);

	return (
		<div className="sm:p-6">
			<h1 className="text-center text-2xl font-bold">Azure Users and Portraits</h1>
			<GlobalSearch placeholder="Search Names" />
			{typeof data === 'string' ? (
				<p>{data}</p>
			) : (
				<>
					<div className="mb-2 overflow-x-auto">
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
								{data.map((user) => (
									<tr key={user.userId + '_' + user.portraitId}>
										<td>
											<div className="flex items-center gap-3">
												<div className="avatar">
													<div className="mask mask-square h-16 w-16">
														<Image
															src={user.portrait ? (portraitUrls.get(user.portrait) ?? Portrait) : Portrait}
															alt={user.name ?? 'Portrait'}
															width={600}
															height={600}
															className="w-full object-contain"
															placeholder={getShimmerImage(600, 600)}
														/>
													</div>
												</div>
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
													<span className="badge badge-ghost badge-sm rounded-xs px-0.5">
														{nullishToString(user.name)}
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
											<Link
												href={user.userId ? `/azure-users/${user.userId}` : `/portraits/${user.portraitId}`}
												className="btn btn-ghost btn-xs"
											>
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
