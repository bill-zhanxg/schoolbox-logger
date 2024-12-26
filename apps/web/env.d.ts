namespace NodeJS {
	interface ProcessEnv {
		BASE_URL: string;
		BACKEND_URL: string;

		XATA_BRANCH: string;
		XATA_API_KEY: string;

		AUTH_SECRET: string;
		AUTH_MICROSOFT_ENTRA_ID_ID: string;
		AUTH_MICROSOFT_ENTRA_ID_SECRET: string;
		AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: string;
	}
}
