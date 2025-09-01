'use client';

import { getColumns } from '@/libs/formatValue';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next13-progressbar';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { v4 } from 'uuid';
import { ColumnsType, getOperators } from '../../libs/schema';
import { DebouncedInput } from './DebouncedInput';

type Filter = {
	id: string;
	parentOperator: string;
	name: string;
	operator: string;
	mode: 'insensitive' | 'default';
	value: string;
};

export function FilterComponent({ type }: { type: 'azure-users' | 'portrait' }) {
	const columns = getColumns(type);
	const defaultFilters: Filter[] = useMemo(() => {
		switch (type) {
			case 'azure-users':
				return [
					{
						id: v4(),
						parentOperator: 'and',
						name: 'displayName',
						operator: 'contains',
						mode: 'insensitive',
						value: '',
					},
				];
			case 'portrait':
				return [
					{
						id: v4(),
						parentOperator: 'and',
						name: 'name',
						operator: 'contains',
						mode: 'insensitive',
						value: '',
					},
				];
			default:
				return [];
		}
	}, [type]);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const searchParamsFilter = searchParams.get('filter');
	let initialFilters;
	try {
		initialFilters = searchParamsFilter ? JSON.parse(searchParamsFilter) : undefined;
	} catch (error) {
		initialFilters = null;
	}
	const [filters, setFilters] = useState<Filter[]>(initialFilters ?? defaultFilters);

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

	useEffect(() => {
		const url = createQueryPathName([
			{
				name: 'filter',
				value: JSON.stringify(filters),
			},
		]);
		router.push(url);
	}, [filters, createQueryPathName, router]);

	return (
		<div className="border-info my-4 flex w-full flex-col gap-2 rounded-lg border-2 p-2">
			<button
				className="btn btn-sm"
				onClick={() =>
					setFilters((filters) => [
						...filters,
						{
							id: v4(),
							parentOperator: 'and',
							name: 'id',
							operator: 'is',
							mode: 'insensitive',
							value: '',
						},
					])
				}
			>
				Add condition to filter
			</button>
			{filters.map((filter, index) => (
				<div key={filter.id} className="flex w-full flex-col items-center gap-2 lg:flex-row">
					<div className="divider m-0"></div>
					<div className="flex w-full justify-between lg:w-fit">
						<span className="block lg:hidden">Filter {index + 1}</span>
						<button
							className="btn btn-circle btn-xs btn-neutral"
							onClick={() => setFilters((filters) => removeFilter(filters, filter))}
						>
							<FaXmark size={18} />
						</button>
					</div>
					<select
						className="select select-bordered select-sm w-full lg:w-fit"
						value={filter.parentOperator}
						onChange={(value) => {
							setFilters((filters) => {
								return setFilterValue(filters, filter, 'parentOperator', value.target.value);
							});
						}}
					>
						<option value="and">and</option>
						<option value="or">or</option>
					</select>
					<select
						className="select select-bordered select-sm w-full grow lg:w-fit"
						value={filter.name}
						onChange={(value) => {
							setFilters((filters) => {
								return setFilterValue(filters, filter, 'name', value.target.value);
							});
						}}
					>
						{columns.map((column) => (
							<option key={column.name} value={column.name}>
								{column.name}
							</option>
						))}
					</select>
					<OperationSelect filter={filter} setFilters={setFilters} type={type} />
					{getColumn(filter.name, type)?.type === 'string' && (
						<select
							className="select select-bordered select-sm w-full lg:w-fit"
							value={filter.mode}
							onChange={(value) => {
								setFilters((filters) => {
									return setFilterValue(filters, filter, 'mode', value.target.value);
								});
							}}
						>
							<option value={'insensitive'}>Insensitive</option>
							<option value={'default'}>Default</option>
						</select>
					)}
					{!(filter.operator === 'exists' || filter.operator === 'notExists') && (
						<FilterInput filter={filter} setFilters={setFilters} type={type} />
					)}
				</div>
			))}
		</div>
	);
}

function setFilterValue(filters: Filter[], filter: Filter, key: keyof Filter, value: string) {
	const index = filters.findIndex((f) => f.id === filter.id);
	if (filter[key] === value) return filters;
	filters[index] = {
		...filters[index],
		[key]: value,
	};
	return [...filters];
}

function removeFilter(filters: Filter[], filter: Filter) {
	return filters.filter((f) => f.id !== filter.id);
}

export function getColumn(name: string, type: ColumnsType) {
	return getColumns(type).find((column) => column.name === name);
}

function OperationSelect({
	filter,
	setFilters,
	type,
}: {
	filter: Filter;
	setFilters: Dispatch<SetStateAction<Filter[]>>;
	type: ColumnsType;
}) {
	const operators = useMemo(() => getOperators(type, filter.name), [type, filter.name]);
	useEffect(() => {
		setFilters((filters) => {
			if (!operators.find((operator) => operator.value === filter.operator)) {
				if (operators.length) return setFilterValue(filters, filter, 'operator', operators[0].value);
				else return removeFilter(filters, filter);
			} else return filters;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter.name, operators]);

	return (
		<select
			className="select select-bordered select-sm w-full lg:w-fit"
			value={filter.operator}
			onChange={(value) => {
				setFilters((filters) => {
					return setFilterValue(filters, filter, 'operator', value.target.value);
				});
			}}
		>
			{operators.map((operator) => (
				<option key={operator.value} value={operator.value}>
					{operator.label}
				</option>
			))}
		</select>
	);
}

function FilterInput({
	filter,
	setFilters,
	type,
}: {
	filter: Filter;
	setFilters: Dispatch<SetStateAction<Filter[]>>;
	type: ColumnsType;
}) {
	const column = getColumn(filter.name, type);
	const columnType = column?.type;
	return columnType ? (
		columnType === 'string' ||
		columnType === 'email' ||
		columnType === 'multiple' ||
		columnType === 'text' ||
		columnType === 'int' ? (
			<DebouncedInput
				value={filter.value}
				onChange={(value) => {
					setFilters((filters) => {
						return setFilterValue(filters, filter, 'value', value);
					});
				}}
				placeholder="Filter Expression"
			/>
		) : columnType === 'bool' ? (
			<div className="join w-40">
				<button
					type="button"
					className={`btn btn-sm join-item w-1/2${filter.value === 'true' ? 'btn-primary' : ''}`}
					onClick={() => {
						setFilters((filters) => {
							return setFilterValue(filters, filter, 'value', 'true');
						});
					}}
				>
					True
				</button>
				<button
					type="button"
					className={`btn btn-sm join-item w-1/2${filter.value === 'false' ? 'btn-primary' : ''}`}
					onClick={() => {
						setFilters((filters) => {
							return setFilterValue(filters, filter, 'value', 'false');
						});
					}}
				>
					False
				</button>
			</div>
		) : columnType === 'datetime' ? (
			<input
				type="datetime-local"
				className="input input-bordered input-sm min-w-48 grow"
				onChange={(value) => {
					setFilters((filters) => {
						let date;
						try {
							date = new Date(value.target.value).toISOString();
						} catch (e) {
							date = '';
						}
						return setFilterValue(filters, filter, 'value', date);
					});
				}}
			/>
		) : (
			<input type="text" className="input input-bordered input-sm grow" disabled />
		)
	) : (
		<input type="text" className="input input-bordered input-sm grow" disabled />
	);
}
