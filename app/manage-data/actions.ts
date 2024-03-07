'use server';

import { auth } from '@/libs/auth';
import { chunk } from '@/libs/formatValue';
import { FormState } from '@/libs/types';
import { getXataClient } from '@/libs/xata';

export async function fetchDataForm(prevState: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	if (!session)
		return {
			message: 'Unauthorized',
			success: false,
		};
	// We don't need to validate the types of the inputs, backend will do that
	const azureToken = formData.get('azure-token');
	const schoolboxDomain = formData.get('schoolbox-domain');
	const schoolboxCookie = formData.get('schoolbox-cookie');

	const button = formData.get('button');
	if (!button) return prevState;

	console.log(azureToken, schoolboxDomain, schoolboxCookie, button);

	// fetch('http://localhost:8000/azure-users', {
	// 	method: 'POST',
	// 	body: JSON.stringify({ azureToken }),
	// 	headers: {
	// 		Authorization: process.env.AUTH_SECRET,
	// 		'Content-Type': 'application/json',
	// 	},
	// }).then(console.log);

	// 'use server';
	// const session = await auth();
	// if (!session) return Unauthorized;
	// const schoolboxDomain = formData.get('schoolbox-domain');
	// const schoolboxCookie = formData.get('schoolbox-cookie');

	// fetch('http://localhost:8000/scan-portraits', {
	//     method: 'POST',
	//     body: JSON.stringify({ schoolboxDomain, schoolboxCookie }),
	//     headers: {
	//         Authorization: process.env.AUTH_SECRET,
	//         'Content-Type': 'application/json',
	//     },
	// }).then(console.log);

	return {
		message: 'Success',
		success: true,
	};
}

export async function clear() {
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
}
