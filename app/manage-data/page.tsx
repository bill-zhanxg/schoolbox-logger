import { auth } from '@/libs/auth';
import { chunk } from '@/libs/formatValue';
import { getXataClient } from '@/libs/xata';
import { Unauthorized } from '../globalComponents/Unauthorized';

export default function LogData() {
	return (
		<div className="p-6">
			<div className="w-full bg-base-100 rounded-xl border-2 border-base-200 shadow-lg shadow-base-200 p-4">
				<h1 className="text-2xl font-bold text-center">Data Management</h1>
				<div className="flex flex-col sm:flex-row gap-6 p-4 w-full">
					<div className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary shadow-lg shadow-border-primary p-4 w-full">
						<h1 className="font-bold">Azure Logging</h1>
						<p className="text-center">
							Get the most recent change from Azure, current data will be moved to history table
						</p>
						<form
							action={async (formData) => {
								'use server';
								const session = await auth();
								if (!session) return Unauthorized;
								const azureToken = formData.get('azure-token');

								fetch('http://localhost:8000/azure-users', {
									method: 'POST',
									body: JSON.stringify({ azureToken }),
									headers: {
										Authorization: process.env.AUTH_SECRET,
										'Content-Type': 'application/json',
									},
								}).then(console.log);
							}}
						>
							<input type="text" name="azure-token" placeholder="azure-token" />
							<button className="btn">test</button>
						</form>
					</div>
					<div className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary shadow-lg shadow-border-primary p-4 w-full">
						<h1 className="font-bold">Schoolbox Logging</h1>
						<p className="text-center">Get the new batches of Schoolbox data</p>
						<form
							action={async (formData) => {
								'use server';
								const session = await auth();
								if (!session) return Unauthorized;
								const schoolboxDomain = formData.get('schoolbox-domain');
								const schoolboxCookie = formData.get('schoolbox-cookie');

								fetch('http://localhost:8000/scan-portraits', {
									method: 'POST',
									body: JSON.stringify({ schoolboxDomain, schoolboxCookie }),
									headers: {
										Authorization: process.env.AUTH_SECRET,
										'Content-Type': 'application/json',
									},
								}).then(console.log);
							}}
						>
							<input type="text" name="schoolbox-domain" placeholder="schoolbox-domain" />
							<input type="text" name="schoolbox-cookie" placeholder="schoolbox-cookie" />
							<button className="btn">test</button>
						</form>
					</div>
				</div>
				<form
					action={async () => {
						'use server';
						const xata = getXataClient();

						// const allPortraits = (await xata.db.portraits.select(['id']).getAll()).map((portrait) => portrait.id);
						// const allPortraitLogs = (await xata.db.portrait_logs.select(['id']).getAll()).map((portrait) => portrait.id);
						const allUserHistory = (await xata.db.users_history.select(['id']).getAll()).map((portrait) => portrait.id);
						// const chunks = chunk(allPortraits);
						// for (const chunk of chunks)
						// 	await xata.transactions.run(
						// 		chunk.map((id) => ({
						// 			delete: {
						// 				table: 'portraits',
						// 				id,
						// 			},
						// 		})),
						// 	);
						// console.log('removed all portraits, removing portrait logs');
						// const chunks2 = chunk(allPortraitLogs);
						// for (const chunk of chunks2)
						// 	await xata.transactions.run(
						// 		chunk.map((id) => ({
						// 			delete: {
						// 				table: 'portrait_logs',
						// 				id,
						// 			},
						// 		})),
						// 	);
						// console.log('removed all portrait logs');
						const chunks2 = chunk(allUserHistory);
						for (const chunk of chunks2)
							await xata.transactions.run(
								chunk.map((id) => ({
									delete: {
										table: 'users_history',
										id,
									},
								})),
							);
						console.log('removed all user history');
					}}
				>
					<button className="btn">test</button>
				</form>
			</div>
		</div>
	);
}
