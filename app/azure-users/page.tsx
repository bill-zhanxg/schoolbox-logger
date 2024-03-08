import { SearchParams } from '@/libs/types';
import { DatabaseSchema, getXataClient } from '@/libs/xata';
import { Model, XataDialect } from '@xata.io/kysely';
import { Kysely } from 'kysely';
import { Filter } from './components/Filter';
import { azureUserColumns } from './types';

const xata = getXataClient();

export default async function AzureUsers({ searchParams }: { searchParams: SearchParams }) {
	const db = new Kysely<Model<DatabaseSchema>>({
		dialect: new XataDialect({ xata }),
	});

	const records = await db
		.selectFrom('users')
		.leftJoin('portraits', 'users.mail', 'portraits.mail')
		.select(['users.mail', 'portraits.portrait'])
		.offset(200)
		.limit(10)
		.execute();

	console.log(records);

	const data = await getXataClient()
		.db.users.filter({
			// givenName: {
			//     $is: ""
			// },
			// surname: {
			//     $is: ""
			// }
		})
		.getMany();

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
			<h1>data</h1>
			<Filter />
			{data.map((user) => (
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
			))}
		</div>
	);
}

function parseSearchParams(searchParams: SearchParams) {
	const newColumns = azureUserColumns.map((column) => {
		let value: SearchParams[string] | boolean | Date = searchParams[column.name];
		// if (column.type === 'datetime') {
		// 	value = new Date(value);
		// }
		return {
			name: column.name,
			value,
		};
	});

	return newColumns;
}
