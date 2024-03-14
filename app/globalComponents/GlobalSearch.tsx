'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next13-progressbar';
import { useCallback } from 'react';
import { DebouncedInput } from './DebouncedInput';

export function GlobalSearch() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const searchParamsFilter = searchParams.get('search');
	let initialFilters;
	try {
		initialFilters = searchParamsFilter ? JSON.parse(searchParamsFilter) : undefined;
	} catch (error) {
		initialFilters = null;
	}

	const createQueryPathName = useCallback(
		(newParams: { name: string; value: string }[]) => {
			const params = new URLSearchParams(searchParams.toString());
			newParams.forEach((newParam) => {
				params.set(newParam.name, newParam.value);
			});

			return pathname + '?' + params.toString();
		},
		[searchParams, pathname],
	);

	return (
		<div className="flex items-center justify-center mt-4">
			<DebouncedInput
				className="input input-bordered input-sm w-full"
				type="text"
				placeholder="Global Search"
				value={initialFilters || ''}
				onChange={(value) => {
					const url = createQueryPathName([
						{
							name: 'search',
							value: value,
						},
					]);
					router.push(url);
				}}
			/>
		</div>
	);
}
