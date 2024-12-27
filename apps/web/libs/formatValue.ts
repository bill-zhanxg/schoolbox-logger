import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { dayjs } from './dayjs';
import { s3Client } from './s3-sdk';
import { ColumnsType, azureUserColumns, getOperators, portraitColumns } from './schema';
import { SearchParams } from './types';

/**
 * This returns a full URL with ending slash, can be only called from backend though it does not throw error if called from frontend
 */
export const backendUrl = process.env.BACKEND_URL ? new URL(process.env.BACKEND_URL) : undefined;

export function stringifySearchParam(searchParams: Awaited<SearchParams>): { [key: string]: string | undefined } {
	for (const key in searchParams) {
		if (Array.isArray(searchParams[key])) searchParams[key] = searchParams[key]?.[0];
	}
	return searchParams as { [key: string]: string | undefined };
}

export function formatDate(date?: string | null, timezone = dayjs.tz.guess()): Date | undefined {
	if (!date) return undefined;
	return dayjs.tz(`${date} 12:00`, timezone).toDate();
}

export function formatTime(date?: Date | null, time?: string | null, timezone = dayjs.tz.guess()): Date | undefined {
	if (!date || !time) return undefined;
	return dayjs.tz(`${dayjs.tz(date, timezone).format('YYYY-MM-DD')} ${time}`, timezone).toDate();
}

export function getDateStart(date = new Date()): Date {
	return dayjs(date).subtract(12, 'hour').toDate();
}

export function getDateEnd(date = new Date()): Date {
	return dayjs(date).add(12, 'hour').toDate();
}

export function chunk<T>(array: T[], chunkSize = 1000): T[][] {
	const R = [];
	for (let i = 0, len = array.length; i < len; i += chunkSize) R.push(array.slice(i, i + chunkSize));
	return R;
}

export function nullishToString(value: string | number | null | undefined): string {
	return value ? `${value}` : '---';
}

export function nullishToUndefined<T>(value: T | null | undefined): T | undefined {
	return value ?? undefined;
}

export const ParseFilterSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		operator: z.string(),
		parentOperator: z.string(),
		mode: z.enum(['insensitive', 'default']),
		value: z.string(),
	}),
);
export type ParseFilters = z.infer<typeof ParseFilterSchema>;

/**
 * If return string, it's an error message, make sure to handle error if pass straight the filter function
 */
export function parseSearchParamsFilter<T extends ColumnsType>(
	searchParams: Awaited<SearchParams>,
	type: T,
): ('azure-users' extends T ? Prisma.AzureUsersWhereInput : Prisma.PortraitsWhereInput) | string | undefined {
	const columns = getColumns(type);
	try {
		const filters = stringifySearchParam(searchParams).filter;
		if (!filters) return undefined;
		const filterObject = ParseFilterSchema.safeParse(JSON.parse(filters));
		if (!filterObject.success) return 'Invalid filter object';
		let allFilters: ParseFilters = filterObject.data.filter((filter) => filter.parentOperator === 'and');
		let anyFilters: ParseFilters = filterObject.data.filter((filter) => filter.parentOperator === 'or');
		const getFilterColumn = (filter: ParseFilters[number]) => {
			const operator = filter.operator;
			const columnType = columns.find((column) => column.name === filter.name)?.type;

			if (!columnType || !filter.value) return {};

			if (operator === 'null') {
				return { [filter.name]: null };
			}
			if (operator === 'notNull') {
				return { [filter.name]: { not: null } };
			}

			const allowedOperators = getOperators(type, filter.name).map((operator) => operator.value);
			if (!allowedOperators.includes(operator)) return {};

			if (operator === '$exists' || operator === '$notExists') return { [operator]: filter.name };
			const getFilterValue = () => {
				switch (columnType) {
					case 'bool':
						return filter.value === 'true' ? true : filter.value === 'false' ? false : undefined;
					case 'datetime':
						return new Date(filter.value);
					case 'int':
						return parseInt(filter.value, 10);
					default:
						return filter.value;
				}
			};

			const filterValue = getFilterValue();
			return {
				[filter.name]: {
					[operator]: filterValue,
					mode: filter.mode,
				},
			};
		};
		const newFilters: 'azure-users' extends T ? Prisma.AzureUsersWhereInput : Prisma.PortraitsWhereInput = {
			AND: allFilters.map((filter) => getFilterColumn(filter)).filter((filter) => !isEmpty(filter)),
			OR: anyFilters.map((filter) => getFilterColumn(filter)).filter((filter) => !isEmpty(filter)),
		};
		if (Array.isArray(newFilters.AND) && newFilters.AND.length === 0) delete newFilters.AND;
		if (Array.isArray(newFilters.OR) && newFilters.OR.length === 0) delete newFilters.OR;
		if (isEmpty(newFilters)) return undefined;
		return newFilters;
	} catch (error) {
		return undefined;
	}
}

export function getColumns(type: ColumnsType) {
	return (type === 'azure-users' ? azureUserColumns : portraitColumns).filter((column) => column.type !== 'file');
}

function isEmpty(obj: Object) {
	for (const prop in obj) {
		if (Object.hasOwn(obj, prop)) {
			return false;
		}
	}
	return true;
}

export async function getSignedUrlMap<
	T extends {
		portrait: string | null;
	},
>(data?: string | T | T[] | null): Promise<Map<string, string>> {
	const portraitUrls: Map<string, string> =
		typeof data === 'string' || !data
			? new Map()
			: new Map(
					await Promise.all(
						(Array.isArray(data) ? data : [data])
							.filter((portrait) => portrait.portrait)
							.map(async (portrait) => {
								const command = new GetObjectCommand({
									Bucket: process.env.BUCKET_NAME,
									Key: portrait.portrait!,
								});
								const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
								return [portrait.portrait!, url] as const;
							}),
					),
				);
	return portraitUrls;
}
