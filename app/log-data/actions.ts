'use server';

import { getXataClient } from '@/libs/xata';
import { AuthProviderCallback, Client } from '@microsoft/microsoft-graph-client';
import * as cheerio from 'cheerio';
import Queue from 'queue';
// import { User } from '@microsoft/microsoft-graph-types';

const xata = getXataClient();

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
	// await client
	// 	.api('https://graph.microsoft.com/v1.0/users')
	// 	.query({
	// 		$select:
	// 			'accountEnabled,ageGroup,businessPhones,city,createdDateTime,department,displayName,givenName,id,lastPasswordChangeDateTime,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,onPremisesSamAccountName,onPremisesSyncEnabled,postalCode,streetAddress,surname,userType,',
	// 	})
	// 	.get()
	// 	.then((res: { '@odata.context': string; '@odata.nextLink'?: string; values: User[] }) => {
	// 		console.log(res);
	// 		// nextLink = res['@odata.nextLink'];
	// 		console.log(res['@odata.nextLink']);

	// 	});
	// }

	const portraitList = [];
	const q = new Queue();

	for (let i = 8200; i < 8300; i++) {
		q.push((cb) => {
			if (!cb) throw new Error('Callback is not defined');

			fetch(`${schoolboxDomain}/search/user/${i}`, {
				headers: {
					authorization: 'Bearer ' + schoolboxToken,
				},
			})
				.then(async (res) => {
					if (res.ok) {
						const $ = cheerio.load(await res.text());
						const email = $('#content .content dd a').text();
						if (email.trim()) {
							console.log(email);
							// No need authorization for this request
							fetch(`${schoolboxDomain}/portrait.php?id=${i}`)
								.then(async (res) => {
									console.log(res.status);
									if (res.ok) {
										console.log(res.body);
										// Database action
										const portrait = await res.blob();

										xata.db.portraits
											.create({
												mail: email,
												portrait: portrait,
											})
											.catch((err) => {
												// TODO
												console.log('database error', err);
											})
											.finally(() => {
												cb();
											});
									} else {
										console.log(`Failed getting portrait for ${i}`, res.status);
										cb();
									}
								})
								.catch((err) => {
									// TODO
									console.log(err);
									cb();
								});
						}
					} else {
						console.log(res.statusText);
						cb();
					}
				})
				.catch((err) => {
					// TODO
					console.log(err);
					cb();
				});
		});
	}

	q.start((err) => {
		// TODO
		if (err) throw err;
		console.log('all done:', q);
	});

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
