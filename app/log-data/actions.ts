'use server';

import { auth } from '@/libs/auth';
import { getXataClient } from '@/libs/xata';
import { Unauthorized } from '../globalComponents/Unauthorized';

const xata = getXataClient();

export async function azure(formData: FormData) {
	const session = await auth();
	if (!session) return Unauthorized;
	const azureToken = formData.get('azure-token');
	const schoolboxDomain = formData.get('schoolbox-domain');
	const schoolboxCookie = formData.get('schoolbox-cookie');

	fetch('http://localhost:8000/scan-portraits', {
		method: 'POST',
		body: JSON.stringify({ azureToken, schoolboxDomain, schoolboxCookie }),
		headers: {
			Authorization: process.env.AUTH_SECRET,
			'Content-Type': 'application/json',
		},
	}).then(console.log);
}
