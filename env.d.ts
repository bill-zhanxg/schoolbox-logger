declare namespace NodeJS {
	interface ProcessEnv {
		AUTH_SECRET: string;
		DATABASE_URL: string;
		SHADOW_DATABASE_URL?: string;

		BUCKET_NAME: string;
		S3_URL: string;
		S3_ACCESS_KEY_ID: string;
		S3_SECRET_ACCESS_KEY: string;
	}
}
