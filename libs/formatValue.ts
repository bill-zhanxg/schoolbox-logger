import { dayjs } from './dayjs';
import { SearchParams } from './types';

/**
 * This returns a full URL with ending slash
 */
export const backendUrl = new URL(process.env.BACKEND_URL);

export function stringifySearchParam(searchParams: SearchParams): { [key: string]: string | undefined } {
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
