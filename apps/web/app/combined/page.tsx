import Portrait from '@/images/portrait.png';
import { auth } from '@/libs/auth';
import { dayjs } from '@/libs/dayjs';
import { stringifySearchParam } from '@/libs/formatValue';
import { getShimmerImage } from '@/libs/shimmerImage';
import { SearchParams } from '@/libs/types';
import { PortraitsRecord, UsersRecord, getXataClient } from '@/libs/xata';
import { Page, SelectedPick } from '@xata.io/client';
import { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { PaginationMenu } from '../globalComponents/PaginationMenu';
import { GlobalSearch } from '../globalComponents/Search';

const xata = getXataClient();

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const session = await auth();
	if (!session) return null;
	const pageSize = 50;
	const { page, search } = stringifySearchParam(searchParams);

	// Work around total, we're reading from two different tables
	const total = 0;
	const data: Page<UsersRecord, Readonly<SelectedPick<UsersRecord, ['*']>>> = await xata.db.users
		.filter(search ? { displayName: { $iContains: search } } : {})
		.getPaginated({
			consistency: 'eventual',
			pagination: {
				offset: page ? (parseInt(page) - 1) * pageSize : 0,
				size: pageSize,
			},
		});
	const portraits = await xata.db.portraits
		.filter({
			$any: {
				name: search ? { $iContains: search } : {},
				mail: { $any: data.records.map((user) => user.mail) },
			},
		})
		.select(['name', 'mail', 'portrait.signedUrl'])
		.getPaginated({
			consistency: 'eventual',
		});

	const portraitOnly = portraits.records.filter(
		(portrait) => !data.records.find((user) => user.mail === portrait.mail),
	);

	return (
		<div className="sm:p-6">
			<h1 className="text-2xl font-bold text-center">Azure Users and Portraits</h1>
			<GlobalSearch placeholder="Search Names" />
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
								{data.records.map((user) => getUserTr(user, portraits, session))}
								{portraitOnly.map((portrait) => (
									<tr key={portrait.id}>
										<td>
											<div className="flex items-center gap-3">
												<div className="avatar">
													<div className="mask mask-square w-12 h-12">
														<Image
															src={portrait?.portrait?.signedUrl ?? Portrait}
															alt={'Portrait'}
															width={300}
															height={300}
															className="object-contain w-full"
															placeholder={getShimmerImage(300, 300)}
														/>
													</div>
												</div>
												<div className="font-bold">{portrait.name}</div>
											</div>
										</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<td>{'---'}</td>
										<th>
											<Link href={`/portraits/${portrait.mail}`} className="btn btn-ghost btn-xs">
												portrait history
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

function getUserTr(
	data: UsersRecord,
	portraits: Page<PortraitsRecord, SelectedPick<PortraitsRecord, ('name' | 'mail' | 'portrait.signedUrl')[]>>,
	session: Session,
) {
	const portrait = portraits.records.find((p) => p.mail === data.mail);

	return (
		<tr key={data.id}>
			<td>
				<div className="flex items-center gap-3">
					<div className="avatar">
						<div className="mask mask-square w-12 h-12">
							<Image
								src={portrait?.portrait?.signedUrl ?? Portrait}
								alt={'Portrait'}
								width={300}
								height={300}
								className="object-contain w-full"
								placeholder={getShimmerImage(300, 300)}
							/>
						</div>
					</div>
					<div>
						<div className="font-bold">{data.displayName}</div>
						<div className="flex gap-1 max-w-32 lg:max-w-none whitespace-nowrap overflow-hidden">
							<span className="badge badge-ghost badge-sm rounded-xs px-0.5">{data.givenName}</span>
							<span className="badge badge-ghost badge-sm rounded-xs px-0.5">{data.surname}</span>
						</div>
						<div>{portrait?.name ?? '---'}</div>
					</div>
				</div>
			</td>
			<td>{data.postalCode ?? '---'}</td>
			<td>{data.city ?? '---'}</td>
			<td>{data.mailNickname ?? '---'}</td>
			<td>{data.department ?? '---'}</td>
			<td>{data.accountEnabled?.toString() ?? '---'}</td>
			<td>
				{data.createdDateTime
					? dayjs.tz(data.createdDateTime, session.user.timezone ?? undefined).format('L LT')
					: '---'}
			</td>
			<td>{data.userType ?? '---'}</td>
			<th>
				<Link href={`/azure-users/${data.id}`} className="btn btn-ghost btn-xs">
					details
				</Link>
			</th>
		</tr>
	);
}
