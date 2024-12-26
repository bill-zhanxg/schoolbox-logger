import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
	region: 'auto',
	endpoint: process.env.S3_URL,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
	},
});
