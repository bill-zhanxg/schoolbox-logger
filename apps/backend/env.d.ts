namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV?: 'development';
		PORT: string;

		XATA_BRANCH: string;
		XATA_API_KEY: string;

		AUTH_SECRET: string;

		BUCKET_NAME: string;
		S3_URL: string;
		S3_ACCESS_KEY_ID: string;
		S3_SECRET_ACCESS_KEY: string;
	}
}
