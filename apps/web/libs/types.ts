export type FormState = {
	success: boolean;
	message: string;
} | null;

export type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
