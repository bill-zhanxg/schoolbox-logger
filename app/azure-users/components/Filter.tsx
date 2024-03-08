'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { InputHTMLAttributes, useCallback, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { azureUserColumns } from '../types';

type Filter = {
	id: string;
	parentOperator: string;
	name: string;
	operator: string;
	value: string;
};

export function Filter() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [filters, setFilters] = useState<Filter[]>([
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: '$is',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'or',
			name: 'id',
			operator: '$is',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: '$is',
			value: '',
		},
		{
			id: v4(),
			parentOperator: 'and',
			name: 'id',
			operator: '$is',
			value: '',
		},
	]);

	const createQueryPathName = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);

			return pathname + '?' + params.toString();
		},
		[searchParams, pathname],
	);

	return (
		// <div className="flex items-center space-x-2">
		// 	<label htmlFor="filter">Filter</label>
		// 	<DebouncedInput
		// 		id="filter"
		// 		value={filter}
		// 		onChange={(value) => console.log(value)}
		// 		className="input"
		// 		placeholder="Filter"
		// 	/>
		// </div>
		<>
			<div className="flex flex-col gap-2 w-full my-6">
				<button className="btn btn-sm">Add condition to filter</button>
				{filters.map((filter, index) => (
					<div key={filter.id} className="flex gap-2 items-center w-full">
						<select className="select select-bordered select-sm" value={filter.parentOperator}>
							<option value="and">and</option>
							<option value="or">or</option>
						</select>
						<select className="select select-bordered select-sm grow" value={filter.name}>
							{azureUserColumns.map((column) => (
								<option key={column.name} value={column.name}>
									{column.name}
								</option>
							))}
						</select>
						<OperationSelect filter={filter} />
						<FilterInput filter={filter} />
					</div>
				))}
			</div>
		</>
	);
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

function OperationSelect({ filter }: { filter: Filter }) {
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
		<select className="border border-gray-300 rounded py-1 px-2 bg-white" value={filter.operator}>
			{operators.map((operator) => (
				<option key={operator.value} value={operator.value}>
					{operator.label}
				</option>
			))}
		</select>
	);
}

function FilterInput({ filter }: { filter: Filter }) {
	return <input type="text" className="input input-bordered input-sm grow" />;
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

	return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}
