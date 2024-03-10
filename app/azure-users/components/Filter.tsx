'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next13-progressbar';
import { Dispatch, InputHTMLAttributes, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { v4 } from 'uuid';
import { azureUserColumns } from '../types';

type Filter = {
	id: string;
	parentOperator: string;
	name: string;
	operator: string;
	value: string;
};

export function FilterComponent() {
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
	const [filters, setFilters] = useState<Filter[]>(
		initialFilters ?? [
			{
				id: v4(),
				parentOperator: 'and',
				name: 'displayName',
				operator: 'iContains',
				value: '',
			},
		],
	);

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
		<div className="flex flex-col gap-2 w-full my-6 border-2 border-info p-2 rounded-lg">
			<button
				className="btn btn-sm"
				onClick={() =>
					setFilters((filters) => [
						...filters,
						{
							id: v4(),
							name: 'id',
							operator: 'is',
							parentOperator: 'and',
							value: '',
						},
					])
				}
			>
				Add condition to filter
			</button>
			{filters.map((filter, index) => (
				<div key={filter.id} className="flex flex-col lg:flex-row gap-2 items-center w-full">
					<div className="divider m-0"></div>
					<div className="flex justify-between w-full lg:w-fit">
						<span className="block lg:hidden">Filter {index + 1}</span>
						<button
							className="btn btn-circle btn-xs btn-neutral"
							onClick={() => setFilters((filters) => filters.filter((f) => f.id !== filter.id))}
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
						className="select select-bordered select-sm grow w-full lg:w-fit"
						value={filter.name}
						onChange={(value) => {
							setFilters((filters) => {
								return setFilterValue(filters, filter, 'name', value.target.value);
							});
						}}
					>
						{azureUserColumns.map((column) => (
							<option key={column.name} value={column.name}>
								{column.name}
							</option>
						))}
					</select>
					<OperationSelect filter={filter} setFilters={setFilters} />
					{!(filter.operator === 'exists' || filter.operator === 'notExists') && (
						<FilterInput filter={filter} setFilters={setFilters} />
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

function getAzureColumn(name: string) {
	return azureUserColumns.find((column) => column.name === name);
}

const stringOperators = [
	{ value: 'is', label: 'is' },
	{ value: 'isNot', label: 'is not' },
	{ value: 'contains', label: 'contains' },
	{ value: 'iContains', label: 'contains (case insensitive)' },
	{ value: 'notExists', label: 'is null' },
	{ value: 'exists', label: 'is not null' },
	{ value: 'startsWith', label: 'starts with' },
	{ value: 'endsWith', label: 'ends with' },
	{ value: 'pattern', label: 'pattern' },
	{ value: 'iPattern', label: 'pattern (case insensitive)' },
	{ value: 'gt', label: 'is greater than' },
	{ value: 'ge', label: 'is greater than or equal to' },
	{ value: 'lt', label: 'is less than' },
	{ value: 'le', label: 'is less than or equal to' },
];
const boolOperators = [
	{ value: 'is', label: 'is' },
	{ value: 'isNot', label: 'is not' },
	{ value: 'notExists', label: 'is null' },
	{ value: 'exists', label: 'is not null' },
];
const multipleOperators = [
	{ value: 'includes', label: 'includes' },
	{ value: 'notExists', label: 'is null' },
	{ value: 'exists', label: 'is not null' },
];
const datetimeOperators = [
	{ value: 'is', label: 'is' },
	{ value: 'isNot', label: 'is not' },
	{ value: 'notExists', label: 'is null' },
	{ value: 'exists', label: 'is not null' },
	{ value: 'gt', label: 'is greater than' },
	{ value: 'ge', label: 'is greater than or equal to' },
	{ value: 'lt', label: 'is less than' },
	{ value: 'le', label: 'is less than or equal to' },
];

function OperationSelect({ filter, setFilters }: { filter: Filter; setFilters: Dispatch<SetStateAction<Filter[]>> }) {
	const column = getAzureColumn(filter.name);
	const columnType = column?.type;
	const operators = useMemo(
		() =>
			columnType
				? columnType === 'string' || columnType === 'email'
					? stringOperators
					: columnType === 'bool'
					? boolOperators
					: columnType === 'multiple'
					? multipleOperators
					: columnType === 'datetime'
					? datetimeOperators
					: []
				: [],
		[columnType],
	);
	useEffect(() => {
		setFilters((filters) => {
			if (!operators.find((operator) => operator.value === filter.operator))
				return setFilterValue(filters, filter, 'operator', operators[0].value);
			else return filters;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [columnType, operators]);

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

function FilterInput({ filter, setFilters }: { filter: Filter; setFilters: Dispatch<SetStateAction<Filter[]>> }) {
	const column = getAzureColumn(filter.name);
	const columnType = column?.type;
	return columnType ? (
		columnType === 'string' || columnType === 'email' || columnType === 'multiple' ? (
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
					className={`btn btn-sm join-item w-1/2${filter.value === 'true' ? ' btn-primary' : ''}`}
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
					className={`btn btn-sm join-item w-1/2${filter.value === 'false' ? ' btn-primary' : ''}`}
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
				className="input input-bordered input-sm grow min-w-48"
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

// A debounced input component
function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string;
	onChange: (value: string) => void;
	debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	return (
		<input
			className="input input-bordered input-sm grow w-full lg:w-fit"
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}
