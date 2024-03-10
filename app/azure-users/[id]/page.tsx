import { auth } from '@/libs/auth';
import { DatabaseSchema, getXataClient } from '@/libs/xata';
import { Model, XataDialect } from '@xata.io/kysely';
import { Kysely } from 'kysely';

const xata = getXataClient();

export default async function User({ params }: { params: { id: string } }) {
	const session = await auth();
	if (!session) return null;

	const db = new Kysely<Model<DatabaseSchema>>({
		dialect: new XataDialect({ xata }),
	});

	const records = await db
		.selectFrom('users')
		.where('users.id', '=', params.id)
		.fullJoin('portraits', 'users.mail', 'portraits.mail')
		.select(['users.mail', 'portraits.portrait'])
		.execute();

	console.log(records[0].portrait);

	// console.log(data)

	// const portriats = await getXataClient().db.portraits.filter({
	//     mail: {
	//         $is: data[0].mail?.toLowerCase()
	//     }
	// }).select([
	//     'portrait.base64Content',
	//     'schoolbox_id'
	// ]).getMany();

	// console.log(portriats)

	return (
		<div>
			{/* <h1>{user.displayName}</h1>
            <div>
                <div>
                    <div className="font-bold">{user.displayName}</div>
                    <div className="flex gap-1">
                        <span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.givenName}</span>
                        <span className="badge badge-ghost badge-sm rounded-sm px-0.5">{user.surname}</span>
                    </div>
                </div>
            </div>
            <div>{user.postalCode ?? '---'}</div>
            <div>{user.city ?? '---'}</div>
            <div>{user.mailNickname ?? '---'}</div>
            <div>{user.department ?? '---'}</div>
            <div>{user.accountEnabled?.toString() ?? '---'}</div>
            <div>
                {user.createdDateTime
                    ? dayjs.tz(user.createdDateTime, session.user.timezone ?? undefined).format('L LT')
                    : '---'}
            </div>
            <div>{user.userType ?? '---'}</div> */}
		</div>
	);
}
