// file deepcode ignore Ssrf: Strictly authenticated path
// file deepcode ignore UseCsurfForExpress: This server uses server authentication instead of cookies
// file deepcode ignore DisablePoweredBy: We don't need to hide the server
const dynamicImport = new Function('specifier', 'return import(specifier)');

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { AuthProviderCallback, Client } from '@microsoft/microsoft-graph-client';
import { User } from '@microsoft/microsoft-graph-types';
import { moveUserToHistory } from '@prisma/client/sql';
import { prisma } from '@repo/database';
import * as cheerio from 'cheerio';
import express, { NextFunction, Request, Response } from 'express';
import type QueueType from 'queue';
import { v4 } from 'uuid';

const app = express();
app.use(express.json());
const port = process.env.PORT ?? '8080';

export function authenticatedUser(req: Request, res: Response, next: NextFunction) {
	const secret = req.headers.authorization;
	if (!secret || secret !== process.env.AUTH_SECRET) res.status(401).send('Unauthorized');
	else next();
}

app.use(express.json());

const workingStatus = {
	schoolbox: false,
	azure: false,
};

app.post('/scan-portraits', authenticatedUser, async (req, res) => {
	(() => {
		if (workingStatus.schoolbox)
			return res.status(400).send('Already processing Schoolbox portraits, please wait until it finished');

		const { schoolboxDomain, schoolboxCookie, schoolboxStartId, schoolboxEndId } = req.body;
		const start = parseInt(schoolboxStartId, 10);
		// End need to be +1 because the loop is exclusive, if parseInt is NaN dw it will still be NaN after +1
		const end = parseInt(schoolboxEndId, 10) + 1;
		// Validate request body
		if (!schoolboxDomain || !schoolboxCookie) return res.status(400).send('Incomplete request body');
		if (Number.isNaN(start) || Number.isNaN(end)) return res.status(400).send('Invalid start or end value');
		let schoolboxUrl: string;
		try {
			schoolboxUrl = new URL(schoolboxDomain).href;
		} catch (err) {
			return res.status(400).send('Invalid schoolbox domain');
		}

		res.send('I got the response, I will process in the background');

		fetchSchoolbox(schoolboxUrl, schoolboxCookie, start, end);
	})();
});

app.post('/azure-users', authenticatedUser, async (req, res) => {
	(async () => {
		if (workingStatus.azure)
			return res.status(400).send('Already processing Azure users, please wait until it finished');

		const { azureToken } = req.body;
		// Validate request body
		if (!azureToken) return res.status(400).send('Incomplete request body');

		const client = Client.init({
			authProvider: (callback: AuthProviderCallback) => {
				callback(null, azureToken as string);
			},
		});

		// Check if key provided is valid
		const valid = await client
			.api('/users')
			.get()
			.then(() => true)
			.catch(() => false);
		if (!valid) {
			console.error('Invalid Azure token');
			return res.status(400).send('Azure token is invalid');
		}

		res.send('I got the response, I will process in the background');

		fetchAzureUsers(client);
	})();
});

app.get('/status', authenticatedUser, async (req, res) => {
	res.send(workingStatus);
});

app.listen(port, () => {
	console.log(`listening on ${port}`);
});

async function fetchSchoolbox(schoolboxUrl: string, schoolboxCookie: string, start: number, end: number) {
	workingStatus.schoolbox = true;

	// We only create s3 client in the function because we rarely use it
	const s3 = new S3Client({
		region: 'auto',
		endpoint: process.env.S3_URL,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
		},
	});

	const Queue = (await dynamicImport('queue')).default;
	// Split the process into chunk of 500 to avoid maximum call stack exceeded
	const chunkSize = 500;
	for (let c = 0; c < Math.ceil((end - start) / chunkSize); c++) {
		const q: QueueType = new Queue();
		const logs: {
			message: string;
			level: 'verbose' | 'info' | 'warning' | 'error';
		}[] = [];

		const remaining = end - start - c * chunkSize;
		for (
			let i = c * chunkSize + start;
			i < c * chunkSize + start + (remaining < chunkSize ? remaining : chunkSize);
			i++
		) {
			q.push(async (cb) => {
				if (!cb) throw new Error('Callback is not defined');

				let retry = true;
				while (retry) {
					retry = false;
					await fetch(`${schoolboxUrl}search/user/${i}`, {
						// Originally I used schoolbox token but portrait API require cookie so why not both use cookie instead?
						headers: {
							cookie: schoolboxCookie,
						},
					})
						.then(async (res) => {
							if (res.ok) {
								const $ = cheerio.load(await res.text());
								const name = $('#content h1').text();
								const email = $('#content .content dd a').text().replaceAll(' ', '').toLowerCase();
								if (email.trim()) {
									let retryPortrait = true;
									while (retryPortrait) {
										retryPortrait = false;

										// We need user cookie to get portrait
										await fetch(`${schoolboxUrl}portrait.php?id=${i}`, {
											headers: {
												cookie: schoolboxCookie,
											},
										})
											.then(async (res) => {
												if (res.ok) {
													const contentDisposition = res.headers.get('content-disposition');
													const contentType = res.headers.get('content-type');
													if (!contentDisposition) {
														// We want to wait and retry the request
														logs.push({
															message: `Can not find content-disposition for ${i} portrait, retrying...`,
															level: 'info',
														});
														console.info(`Can not find content-disposition for ${i} portrait, retrying...`);
														retryPortrait = true;
														await new Promise((resolve) => {
															setTimeout(() => {
																resolve(undefined);
															}, 1000);
														});
														// Stop the current portrait request and retry
														return;
													}
													const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
													const matches = filenameRegex.exec(contentDisposition);
													if (matches != null && matches[1]) {
														const filename = matches[1].replace(/['"]/g, '');
														const portraitBlob = await res.blob();

														try {
															const Key = v4() + `_${filename}`;
															const uploader = new Upload({
																client: s3,
																params: {
																	Bucket: process.env.BUCKET_NAME,
																	Key,
																	Body: portraitBlob,
																	ContentType: contentType || 'image/jpeg',
																},
															});
															await uploader.done();

															await prisma.portraits.create({
																data: {
																	name,
																	mail: email,
																	schoolbox_id: i,
																	portrait: Key,
																},
															});

															logs.push({
																message: `Successfully processed ${i}`,
																level: 'verbose',
															});
															console.log(`Successfully processed ${i}`);

															cb();
														} catch (err: any) {
															logs.push({
																message: `Creating portrait record failed for ${i} with message ${err.message} and stack ${err.stack}, retrying...`,
																level: 'error',
															});
															console.error(`Creating portrait record failed for ${i}, retrying...`, err);
															retryPortrait = true;
															await new Promise((resolve) => {
																setTimeout(() => {
																	resolve(undefined);
																}, 1000);
															});
															// Stop the current portrait request and retry
															return;
														}
													} else {
														logs.push({
															message: `Can not find filename for ${i} portrait`,
															level: 'error',
														});
														console.error(`Can not find filename for ${i} portrait`);
														cb();
													}
												} else {
													logs.push({
														message: `Portrait request not okay for ${i} with status ${res.status} and statusText ${res.statusText}`,
														level: 'error',
													});
													console.error(
														`Portrait request not okay for ${i} with status ${res.status} and statusText ${res.statusText}`,
													);
													cb();
												}
											})
											.catch((err) => {
												logs.push({
													message: `Portrait request failed for ${i} with message ${err.message} and stack ${err.stack}`,
													level: 'error',
												});
												console.error(`Portrait request failed for ${i}`, err);
												cb();
											});
									}
								} else {
									if ($.root().find('title').text().toLocaleLowerCase().includes('unavailable')) {
										// Schoolbox is rate limited (can't handle too many requests)
										// <title>Schoolbox is currently unavailable</title>
										/*
												<div class="row">
													<div id="message">
														<h2>We are experiencing more requests than we can handle.</h2>
														<p>
															We apologise that due to current high volumes of traffic we are unable to process your request at this time.
															Please wait for a minute then try refreshing your page. This problem is generally temporary and will pass
															once traffic returns to normal. If this persists, please contact your IT department to let them know.
														</p>
													</div>
												</div>
											*/
										// We want to wait and retry the request
										logs.push({
											message: `Schoolbox is rate limited for ${i}`,
											level: 'info',
										});
										console.info(`Schoolbox is rate limited for ${i}`);
										retry = true;
										await new Promise((resolve) => {
											setTimeout(() => {
												resolve(undefined);
											}, 3000);
										});
										// Stop the current search request and retry
										return;
									} else {
										// Log the name if it exists
										if (name.trim()) {
											await prisma.portraits
												.create({
													data: {
														name,
														schoolbox_id: i,
													},
												})
												.then(async (portrait) => {
													logs.push({
														message: `Successfully processed ${i} (name only)`,
														level: 'verbose',
													});
													console.log(`Successfully processed ${i} (name only)`);
												})
												.catch((err) => {
													logs.push({
														message: `Creating portrait record failed for ${i} with message ${err.message} and stack ${err.stack}`,
														level: 'error',
													});
													console.error(`Creating portrait record failed for ${i}`, err);
												})
												.finally(() => {
													cb();
												});
										} else {
											// Log a log to database
											logs.push({
												message: `No name and email found for ${i}`,
												level: 'warning',
											});
											console.warn(`No name and email found for ${i}`);
											cb();
										}
									}
								}
							} else {
								logs.push({
									message:
										res.status === 404
											? `User ${i} does not exist`
											: `Search request not okay for ${i} with status ${res.status} and statusText ${res.statusText}`,
									level: res.status === 404 ? 'verbose' : 'error',
								});
								if (res.status === 404) console.log(`User ${i} does not exist`);
								else
									console.error(
										`Search request not okay for ${i} with status ${res.status} and statusText ${res.statusText}`,
									);
								cb();
							}
						})
						.catch(async (err) => {
							logs.push({
								message: `Search request failed okay for ${i} with message ${err.message} and stack ${err.stack}, retrying...`,
								level: 'error',
							});
							console.error(`Search request failed okay for ${i}, retrying...`, err);
							retry = true;
							// We want to wait longer because fetch failed
							await new Promise((resolve) => {
								setTimeout(() => {
									resolve(undefined);
								}, 10000);
							});
							// Optional return statement
							return;
						});
				}
			});
		}

		await new Promise((resolve) => {
			q.start((err) => {
				if (err) throw err;
				logs.push({
					message: `Chunk ${c} is finished`,
					level: 'verbose',
				});
				console.log(`Chunk ${c} is finished`);

				// Upload logs to database
				prisma.portraitLogs
					.createMany({
						data: logs,
					})
					.catch((err) => {
						console.error('Failed to upload logs', err);
					});

				setTimeout(() => {
					resolve(undefined);
				}, 1000);
			});
		});
	}

	workingStatus.schoolbox = false;
	console.log('everything is finished!');
	await prisma.portraitLogs
		.create({
			data: {
				message: 'everything is finished!',
				level: 'verbose',
			},
		})
		.catch(() => {});

	s3.destroy();
}

async function fetchAzureUsers(client: Client) {
	workingStatus.azure = true;

	async function createUserLog(message: string, level: 'verbose' | 'info' | 'warning' | 'error') {
		await prisma.userLogs
			.create({
				data: {
					message,
					level,
				},
			})
			.catch((err) => {
				console.error('Failed to create user log into database', err);
			});
	}

	// Move all users to history
	console.log('Moving users to history...');
	await createUserLog('Moving users to history...', 'verbose');

	const res = await prisma.$queryRawTyped(moveUserToHistory());
	console.log(res);
	console.log('Successfully moved users to history, starting to get users from Azure...');
	await createUserLog('Successfully moved users to history, starting to get users from Azure...', 'verbose');

	let nextLink: string | null = '/users';
	while (nextLink !== null) {
		await client
			.api(nextLink)
			.query(
				nextLink === '/users'
					? {
							$select:
								'accountEnabled,ageGroup,businessPhones,city,createdDateTime,department,displayName,givenName,id,lastPasswordChangeDateTime,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,onPremisesLastSyncDateTime,onPremisesSamAccountName,onPremisesSyncEnabled,postalCode,streetAddress,surname,userType,',
							$top: 999,
						}
					: {},
			)
			.get()
			.then(async (res: { '@odata.context': string; '@odata.nextLink'?: string; value: User[] }) => {
				if (!res['@odata.nextLink']) nextLink = null;
				else nextLink = res['@odata.nextLink'];

				// Upload users to database
				await prisma.azureUsers
					.createMany({
						data: res.value.map(({ id, ...rest }) => ({
							id: id as string,
							...rest,
						})),
					})
					.then(async () => {
						console.log(`Successfully uploaded user batch with nextLink of ${nextLink} to database`);
						await createUserLog(`Successfully uploaded user batch with nextLink of ${nextLink} to database`, 'verbose');
					})
					.catch(async (err) => {
						console.error('Failed to upload users to database, stopping execution', err);
						await createUserLog(
							`Failed to upload users to database with message ${err.message} and stack ${err.stack}, stopping execution`,
							'error',
						);
						nextLink = null;
					});
			})
			.catch(async (err) => {
				console.error('Failed to get users, stopping execution', err);
				await createUserLog(
					`Failed to get users with message ${err.message} and stack ${err.stack}, stopping execution`,
					'error',
				);
				nextLink = null;
			});
	}

	workingStatus.azure = false;
	console.log('everything is finished!');
	await createUserLog('everything is finished!', 'verbose');
}
