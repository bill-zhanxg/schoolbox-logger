'use client';

import { useRouter } from 'next13-progressbar';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Pagination, PaginationList, PaginationNext, PaginationPrev } from 'react-unstyled-pagination';

export function PaginationMenu({ totalPages }: { totalPages: number }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentPage = Number(searchParams.get('page')) || 1;

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			return params.toString();
		},
		[searchParams],
	);

	return (
		<Pagination
			page={currentPage}
			onPageChange={(page) => router.push(`${pathname}?${createQueryString('page', page.toString())}`)}
			total={Math.max(1, totalPages)}
			boundaries={1}
			siblings={1}
			className="mx-auto flex w-full items-center justify-center gap-1"
		>
			<PaginationPrev className="border-base-300 hover:bg-base-200 h-[40px] w-[40px] rounded-lg border-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50">{`<`}</PaginationPrev>
			<PaginationList className="data-[active=true]:bg-primary data-[active=true]:text-primary-content border-base-300 hover:bg-base-200 relative h-[40px] w-[40px] rounded-lg border-2 transition-all" />
			<PaginationNext className="border-base-300 hover:bg-base-200 h-[40px] w-[40px] rounded-lg border-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50">{`>`}</PaginationNext>
		</Pagination>
	);
}
