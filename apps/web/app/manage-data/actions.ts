'use server';
import { auth } from '@/libs/auth';
import { backendUrl } from '@/libs/formatValue';
import { s3Client } from '@/libs/s3-sdk';
import { FormState } from '@/libs/types';
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { moveUserToHistory } from '@prisma/client/sql';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { AlertType } from '../components/Alert';

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
function requestSchoolboxData(schoolboxDomain: any, schoolboxCookie: any, schoolboxStartId: any, schoolboxEndId: any) {
	return fetch(`${backendUrl}scan-portraits`, {
		method: 'POST',
		body: JSON.stringify({ schoolboxDomain, schoolboxCookie, schoolboxStartId, schoolboxEndId }),
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

	try {
		await prisma.$queryRawTyped(moveUserToHistory());
	} catch (error) {
		return {
			message: (error as Error).message || 'Failed to move users to history',
			type: 'error',
		};
	}

	return {
		message: 'All users were moved to history',
		type: 'success',
	};
}

export async function resetUsersHistory(): Promise<AlertType> {
	const session = await auth();
	if (session?.user.role !== 'admin')
		return {
			message: 'Unauthorized',
			type: 'error',
		};

	try {
		await prisma.azureUserHistory.deleteMany();
	} catch (error) {
		return {
			message: (error as Error).message || 'Failed to reset user history',
			type: 'error',
		};
	}

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

	try {
		const deleteAllObjects = async () => {
			const listParams = {
				Bucket: process.env.BUCKET_NAME,
			};

			const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

			if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

			const deleteKeys = listedObjects.Contents.map(({ Key }) => ({ Key })).filter(
				(key): key is { Key: string } => !!key.Key,
			);

			await s3Client.send(
				new DeleteObjectsCommand({
					Bucket: process.env.BUCKET_NAME,
					Delete: { Objects: deleteKeys },
				}),
			);

			if (listedObjects.IsTruncated) {
				await deleteAllObjects();
			}
		};
		await deleteAllObjects();

		await prisma.portraits.deleteMany();
	} catch (error) {
		console.error('Error resetting portraits:', error);
		throw error;
	}

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

	try {
		await prisma.portraitLogs.deleteMany();
	} catch (error) {
		console.error('Error resetting portrait logs:', error);
		throw error;
	}

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

	try {
		await prisma.userLogs.deleteMany();
	} catch (error) {
		console.error('Error resetting user logs:', error);
		throw error;
	}

	return {
		message: 'All user history were removed',
		type: 'success',
	};
}
