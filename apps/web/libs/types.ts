export type FormState = {
	success: boolean;
	message: string;
} | null;

export type SearchParams = { [key: string]: string | string[] | undefined };
