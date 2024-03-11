'use server';

import { auth } from '@/libs/auth';
import { backendUrl, chunk } from '@/libs/formatValue';
import { FormState } from '@/libs/types';
import { getXataClient } from '@/libs/xata';
import { revalidatePath } from 'next/cache';
import { AlertType } from '../components/Alert';

const xata = getXataClient();

function requestAzureData(azureToken: any) {
	return fetch(`${backendUrl}azure-users`, {
		method: 'POST',
		body: JSON.stringify({ azureToken }),
		headers: {
			Authorization: process.env.AUTH_SECRET,
			'Content-Type': 'application/json',
		},
	});
}
function requestSchoolboxData(schoolboxDomain: any, schoolboxCookie: any, start: any, end: any) {
	return fetch(`${backendUrl}scan-portraits`, {
		method: 'POST',
		body: JSON.stringify({ schoolboxDomain, schoolboxCookie, start, end }),
		headers: {
			Authorization: process.env.AUTH_SECRET,
			'Content-Type': 'application/json',
		},
	});
}

export async function fetchDataForm(prevState: FormState, formData: FormData): Promise<FormState> {
	try {
		const session = await auth();
		if (session?.user.role !== 'admin')
			return {
				message: 'Unauthorized',
				success: false,
			};
		// We don't need to validate the types of the inputs, backend will do that
		const azureToken = formData.get('azure-token');
		const schoolboxDomain = formData.get('schoolbox-domain');
		const schoolboxCookie = formData.get('schoolbox-cookie');
		const schoolboxStartId = formData.get('schoolbox-start-id');
		const schoolboxEndId = formData.get('schoolbox-end-id');

		const button = formData.get('button');
		let res: Response;

		if (button === 'all') {
			const azure = await requestAzureData(azureToken);
			const schoolbox = await requestSchoolboxData(schoolboxDomain, schoolboxCookie, schoolboxStartId, schoolboxEndId);

			revalidatePath('/manage-data');
			if (azure.ok && schoolbox.ok) {
				return {
					message: `Both requests were successful. Azure: ${await azure.text()}, Schoolbox: ${await schoolbox.text()}`,
					success: true,
				};
			} else if (!azure.ok && !schoolbox.ok) {
				return {
					message: `Both requests failed. Azure: ${await azure.text()}, Schoolbox: ${await schoolbox.text()}`,
					success: false,
				};
			} else if (!azure.ok) {
				return {
					message: `Azure request failed: ${await azure.text()}. But Schoolbox request was successful: ${await schoolbox.text()}`,
					success: false,
				};
			} else {
				return {
					message: `Schoolbox request failed: ${await schoolbox.text()}. But Azure request was successful: ${await azure.text()}`,
					success: false,
				};
			}
		} else if (button === 'azure') {
			res = await requestAzureData(azureToken);
		} else if (button === 'schoolbox') {
			res = await requestSchoolboxData(schoolboxDomain, schoolboxCookie, schoolboxStartId, schoolboxEndId);
		} else {
			return {
				message: 'The button is not defined, dev tool might be used to send the request',
				success: false,
			};
		}

		const resText = await res.text();
		revalidatePath('/manage-data');
		if (res.ok) {
			return {
				message: resText || 'Success',
				success: true,
			};
		} else {
			return {
				message: resText || 'A fetch error occurred, most likely a network error',
				success: false,
			};
		}
	} catch (error) {
		revalidatePath('/manage-data');
		return {
			message: (error as Error).message ?? 'An unknown error occurred',
			success: false,
		};
	}
}

export async function moveUsersToHistory(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};
	let isContinue: true | string = true;
	while (isContinue === true) {
		const users = await xata.db.users.getMany({ pagination: { size: 1000 } });
		if (users.length === 0) break;
		await xata.transactions
			.run(
				users.map(({ id, xata, ...data }) => ({
					insert: {
						table: 'users_history',
						record: {
							...data,
							user_id: id,
						},
					},
				})),
			)
			.catch((err) => (isContinue = `Failed to move users to history: ${err.message}`));
		await xata.transactions
			.run(users.map(({ id }) => ({ delete: { table: 'users', id } })))
			.catch((err) => (isContinue = `Failed to delete users: ${err.message}`));
	}

	return isContinue === true
		? {
				message: 'All users were moved to history',
				type: 'success',
		  }
		: {
				message: isContinue,
				type: 'error',
		  };
}

export async function resetUsersHistory(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};
	const userHistory = (await xata.db.portraits.select(['id']).getAll()).map((user) => user.id);
	const historyChunk = chunk(userHistory);
	for (const chunk of historyChunk)
		await xata.transactions.run(
			chunk.map((id) => ({
				delete: {
					table: 'users_history',
					id,
				},
			})),
		);
	return {
		message: 'All user history was removed',
		type: 'success',
	};
}

export async function resetPortraits(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};
	const allPortraits = (await xata.db.portraits.select(['id']).getAll()).map((portrait) => portrait.id);
	const chunks = chunk(allPortraits);
	for (const chunk of chunks)
		await xata.transactions.run(
			chunk.map((id) => ({
				delete: {
					table: 'portraits',
					id,
				},
			})),
		);

	return {
		message: 'All portraits were removed',
		type: 'success',
	};
}

export async function resetPortraitLogs(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};
	const allPortraitLogs = (await xata.db.portrait_logs.select(['id']).getAll()).map((portraitLog) => portraitLog.id);
	const chunks = chunk(allPortraitLogs);
	for (const chunk of chunks)
		await xata.transactions.run(
			chunk.map((id) => ({
				delete: {
					table: 'portrait_logs',
					id,
				},
			})),
		);

	return {
		message: 'All portrait logs were removed',
		type: 'success',
	};
}

export async function resetUserLogs(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};
	const allUserHistory = (await xata.db.user_logs.select(['id']).getAll()).map((userLog) => userLog.id);
	const chunks = chunk(allUserHistory);
	for (const chunk of chunks)
		await xata.transactions.run(
			chunk.map((id) => ({
				delete: {
					table: 'users_history',
					id,
				},
			})),
		);

	return {
		message: 'All user history were removed',
		type: 'success',
	};
}
