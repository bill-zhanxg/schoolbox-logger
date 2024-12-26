import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { prisma } from '@repo/database';
import { v4 } from 'uuid';
import { getXataClient } from './libs/xata';

// Check environment variables
if (
	!process.env.S3_URL ||
	!process.env.S3_ACCESS_KEY_ID ||
	!process.env.S3_SECRET_ACCESS_KEY ||
	!process.env.BUCKET_NAME ||
	!process.env.XATA_API_KEY
) {
	throw new Error('Missing environment variables');
}

console.log(process.env.S3_URL, process.env.S3_ACCESS_KEY_ID, process.env.BUCKET_NAME);

(async () => {
	const xata = getXataClient();
	const s3 = new S3Client({
		region: 'auto',
		endpoint: process.env.S3_URL,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
		},
	});

	async function userMigration() {
		let userIdTracker = 0;
		const userIdMap = new Map<string, number>();

		console.log('Migrating all users...');

		// Migrate all azure users
		let users = await xata.db.users.getPaginated({
			pagination: {
				size: 1000,
			},
		});
		while (users.records.length > 0) {
			const allUsers = users.records;
			const azureUsers = allUsers.map((u) => {
				userIdTracker++;
				const { id, xata, ...data } = u;
				userIdMap.set(id, userIdTracker);
				const sanitizedData = Object.fromEntries(
					Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value]),
				);
				return {
					...sanitizedData,
					id: userIdTracker,
					createdAt: xata.createdAt,
					updatedAt: xata.updatedAt,
				};
			});

			await prisma.azureUsers.createMany({
				data: azureUsers,
			});

			users = await users.nextPage(1000);
		}

		console.log('Migrated all users');
		console.log('Migrating all user history...');

		// Migrate all AzureUserHistory
		let userHistories = await xata.db.users_history.getPaginated({
			pagination: {
				size: 1000,
			},
		});
		while (userHistories.records.length > 0) {
			const allUserHistories = userHistories.records;
			const azureUserHistories = allUserHistories.map((uh) => {
				const { id, user_id, xata, ...data } = uh;
				const sanitizedData = Object.fromEntries(
					Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value]),
				);
				const newUserId = userIdMap.get(user_id ?? '');
				if (!newUserId) {
					throw new Error(`User ID not found for user_id: ${user_id}`);
				}
				return {
					...sanitizedData,
					userId: newUserId,
					createdAt: xata.createdAt,
					updatedAt: xata.updatedAt,
				};
			});

			await prisma.azureUserHistory.createMany({
				data: azureUserHistories,
			});

			userHistories = await userHistories.nextPage(1000);
		}
	}

	async function deletePortraits() {
		// Migrate all portraits
		console.log('Deleting all objects in the bucket...');

		const deleteAllObjects = async () => {
			const listParams = {
				Bucket: process.env.BUCKET_NAME,
			};

			const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

			if (!listedObjects.Contents || listedObjects.Contents?.length === 0) return;

			const deleteKeys = listedObjects.Contents.map(({ Key }) => ({ Key })).filter(
				(key): key is { Key: string } => !!key.Key,
			);

			await s3.send(
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

		console.log('Deleted all objects in the bucket');
	}

	async function xataPortraitUpdateSignedUrlExpiration() {
		console.log('Updating all portraits signed url expiration to 1 hour...');

		let portraitsSigned = await xata.db.portraits.select(['id', 'portrait.url']).getPaginated({
			pagination: {
				size: 1000,
			},
		});
		while (portraitsSigned.records.length > 0) {
			// Filter out portraits without a url
			const allPortraits = portraitsSigned.records.filter((p) => p.portrait?.url);

			console.log(`\x1b[33mUpdate Progress Next\x1b[0m`);

			await xata.transactions.run(
				allPortraits.map((p) => ({
					update: {
						table: 'portraits',
						id: p.id,
						fields: {
							portrait: {
								signedUrlTimeout: 3600,
							},
						},
					},
				})),
			);

			portraitsSigned = await portraitsSigned.nextPage(1000);
		}

		console.log('Updated all portraits signed url expiration to 1 hour');
	}

	async function portraitMigration() {
		console.log('Migrating all portraits...');

		let portraits = await xata.db.portraits
			.select(['*', 'portrait.signedUrl', 'portrait.name'])
			// TODO: remove
			.sort('name', 'asc')
			.getPaginated({
				pagination: {
					size: 1000,
				},
			});
		while (portraits.records.length > 0) {
			const allPortraits = portraits.records;
			const azurePortraits: {
				portrait: string | undefined;
				schoolbox_id: number;
				createdAt: Date;
				updatedAt: Date;
			}[] = [];

			for (const [i, p] of allPortraits.entries()) {
				const { id, portrait, schoolbox_id, xata, ...data } = p;
				const sanitizedData = Object.fromEntries(
					Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value]),
				);

				console.log(portrait?.name, portrait?.signedUrl);

				console.log(`\x1b[32mMigrating portrait ${i + 1} of ${allPortraits.length}\x1b[0m`);

				let key: string | undefined;
				if (portrait?.signedUrl) {
					const response = await fetch(portrait.signedUrl);
					const Key = v4() + `_${portrait.name}`;
					const d = await response.blob();
					if (d.size === 0) {
						console.log('\x1b[31mIMPORTANT: No data found for portrait', portrait.name, '\x1b[0m');
						continue;
						// throw new Error('No data found');
					}
					if (d.size === 77) {
						console.log('\x1b[31mIMPORTANT: SignedURL expired for', portrait.name, '\x1b[0m');
						throw new Error('SignedURL expired');
					}
					const uploader = new Upload({
						client: s3,
						params: {
							Bucket: process.env.BUCKET_NAME,
							Key,
							Body: d,
							ContentType: 'image/jpeg',
						},
					});
					uploader.on('httpUploadProgress', (progress) => {
						console.log(`\x1b[36mUpload progress: ${progress.loaded} of ${progress.total} bytes\x1b[0m`);
					});
					await uploader.done();
					key = Key;
				}

				azurePortraits.push({
					...sanitizedData,
					portrait: key,
					schoolbox_id: schoolbox_id as number,
					createdAt: xata.createdAt,
					updatedAt: xata.updatedAt,
				});
			}

			await prisma.portraits.createMany({
				data: azurePortraits,
			});

			portraits = await portraits.nextPage(1000);

			console.log(`\x1b[32mMigrated ${allPortraits.length} portraits\x1b[0m`);
		}
	}

	// await userMigration();
	// await deletePortraits();
	// await xataPortraitUpdateSignedUrlExpiration();
	await portraitMigration();

	console.log('\x1b[32mEverything is finished!\x1b[0m');
})();
