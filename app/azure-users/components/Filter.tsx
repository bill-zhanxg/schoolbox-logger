'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next13-progressbar';
import { Dispatch, InputHTMLAttributes, SetStateAction, useCallback, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { azureUserColumns } from '../types';

type Filter = {
	id: string;
	parentOperator: string;
	name: string;
	operator: string;
	// TODO: Change value to be a type that matches the column type
	value: string;
};

export function Filter() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const [filters, setFilters] = useState<Filter[]>([
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: 'is',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'or',
			name: 'id',
			operator: 'isNot',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: 'is',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: 'is',
			value: '',
		},
	]);

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
		<div className="flex flex-col gap-2 w-full my-6">
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
			{filters.map((filter) => (
				<div key={filter.id} className="flex gap-2 items-center w-full">
					{/* TODO: Remove icon */}
					<select
						className="select select-bordered select-sm"
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
						className="select select-bordered select-sm grow"
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
					<FilterInput filter={filter} setFilters={setFilters} />
				</div>
			))}
		</div>
	);
}

function setFilterValue(filters: Filter[], filter: Filter, key: string, value: string) {
	const index = filters.findIndex((f) => f.id === filter.id);
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
	const operators = columnType
		? columnType === 'string' || columnType === 'email'
			? stringOperators
			: columnType === 'bool'
			? boolOperators
			: columnType === 'multiple'
			? multipleOperators
			: columnType === 'datetime'
			? datetimeOperators
			: []
		: [];
	return (
		<select
			className="border border-gray-300 rounded py-1 px-2 bg-white"
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
						return setFilterValue(filters, filter, 'value', value as string);
					});
				}}
				placeholder="Filter Expression"
			/>
		) : columnType === 'bool' ? (
			<input type="button" className="input input-bordered input-sm grow" />
		) : columnType === 'datetime' ? (
			<input type="datetime-local" className="input input-bordered input-sm grow" />
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
	value: string | number;
	onChange: (value: string | number) => void;
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
	}, [value, debounce, onChange]);

	return (
		<input
			className="input input-bordered input-sm grow"
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}
