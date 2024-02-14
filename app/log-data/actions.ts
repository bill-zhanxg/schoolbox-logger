'use server';

// import * as cheerio from 'cheerio';
import { AuthProviderCallback, Client } from '@microsoft/microsoft-graph-client';
import { User } from '@microsoft/microsoft-graph-types';

export async function azure(formData: FormData) {
	const azureToken = formData.get('azure-token');
	const schoolboxDomain = formData.get('schoolbox-domain');
	const schoolboxToken = formData.get('schoolbox-token');
	const client = Client.init({
		authProvider: (callback: AuthProviderCallback) => {
			callback(null, azureToken as string);
		},
	});

	// let nextLink = '/users';
	// while (nextLink !== null) {
	await client
		.api('https://graph.microsoft.com/v1.0/users')
		.query({
			$select:
				'accountEnabled,ageGroup,businessPhones,city,createdDateTime,department,displayName,givenName,id,lastPasswordChangeDateTime,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,onPremisesSamAccountName,onPremisesSyncEnabled,postalCode,streetAddress,surname,userType,',
		})
		.get()
		.then((res: { '@odata.context': string; '@odata.nextLink'?: string; values: User[] }) => {
			console.log(res);
			// nextLink = res['@odata.nextLink'];
			console.log(res['@odata.nextLink']);

		});
	// }

	// fetch(`${schoolboxDomain}/search/user/8294`, {
	// 	headers: {
	// 		authorization: 'Bearer ' + schoolboxToken,
	// 	},
	// })
	// 	.then(async (res) => {
	// 		if (res.ok) {
	// 			const $ = cheerio.load(await res.text());
	// 			const email = $('#content .content dd a').text();
	// 			if (email.trim()) {
	// 				console.log(email);
	// 				// No need authorization for this request
	// 				fetch(`${schoolboxDomain}/portrait.php?id=8294`)
	// 					.then(async (res) => {
	// 						console.log(res.status);
	// 						if (res.ok) {
	// 							console.log(res.body);

	// 							// Database action
	// 						}
	// 					})
	// 					.catch((err) => {
	// 						console.log(err);
	// 					});
	// 			}
	// 		}
	// 	})
	// 	.catch(() => {});

	// const crawler = new Crawler({
	// 	maxConnections: 10,
	// 	callback: (error, res, done) => {
	// 		if (res.request.method)
	// 			if (error) {
	// 				console.log(error);
	// 			} else {
	// 				const $ = res.$;
	// 				// $ is Cheerio by default
	// 				console.log($.html());
	// 			}
	// 		done();
	// 	},
	// 	headers: {
	// 		authorization:
	// 			'Bearer ' + schoolboxToken
	// 	},
	// 	method: 'GET',
	// });
}
