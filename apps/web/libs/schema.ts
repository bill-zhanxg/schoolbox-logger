import { getColumns } from './formatValue';

export type ColumnsType = 'azure-users' | 'portrait';

const defaultColumns = [
	{ name: 'id', type: 'string' },
	{ name: 'xata.createdAt', type: 'datetime' },
	{ name: 'xata.updatedAt', type: 'datetime' },
	{ name: 'xata.version', type: 'string' },
] as const;

export const azureUserColumns = [
	...defaultColumns,
	...[
		{ name: 'accountEnabled', type: 'bool' },
		{ name: 'ageGroup', type: 'string' },
		{ name: 'businessPhones', type: 'multiple' },
		{ name: 'city', type: 'string' },
		{ name: 'createdDateTime', type: 'datetime' },
		{ name: 'department', type: 'string' },
		{ name: 'displayName', type: 'string' },
		{ name: 'givenName', type: 'string' },
		{ name: 'lastPasswordChangeDateTime', type: 'datetime' },
		{ name: 'mail', type: 'email' },
		{ name: 'mailNickname', type: 'string' },
		{ name: 'mobilePhone', type: 'string' },
		{ name: 'onPremisesDistinguishedName', type: 'string' },
		{ name: 'onPremisesSamAccountName', type: 'string' },
		{ name: 'onPremisesSyncEnabled', type: 'bool' },
		{ name: 'postalCode', type: 'string' },
		{ name: 'streetAddress', type: 'string' },
		{ name: 'surname', type: 'string' },
		{ name: 'userType', type: 'string' },
		{ name: 'onPremisesLastSyncDateTime', type: 'datetime' },
	],
] as const;

export const portraitColumns = [
	...defaultColumns,
	...[
		{ name: 'mail', type: 'email' },
		{ name: 'portrait', type: 'file' },
		{ name: 'schoolbox_id', type: 'int' },
		{ name: 'name', type: 'text' },
	],
] as const;

export const stringOperators = [
	{ value: 'equals', label: 'equals' },
	{ value: 'not', label: 'not' },
	{ value: 'contains', label: 'contains' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
	{ value: 'startsWith', label: 'starts with' },
	{ value: 'endsWith', label: 'ends with' },
	{ value: 'gt', label: 'is greater than' },
	{ value: 'gte', label: 'is greater than or equal to' },
	{ value: 'lt', label: 'is less than' },
	{ value: 'lte', label: 'is less than or equal to' },
];
export const boolOperators = [
	{ value: 'equals', label: 'equals' },
	{ value: 'not', label: 'not' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
];
export const multipleOperators = [
	{ value: 'has', label: 'has' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
];
export const datetimeOperators = [
	{ value: 'is', label: 'is' },
	{ value: 'not', label: 'not' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
	{ value: 'gt', label: 'is greater than' },
	{ value: 'gte', label: 'is greater than or equal to' },
	{ value: 'lt', label: 'is less than' },
	{ value: 'lte', label: 'is less than or equal to' },
];
export const integerOperators = [
	{ value: 'is', label: 'is' },
	{ value: 'not', label: 'not' },
	{ value: 'null', label: 'is null' },
	{ value: 'notNull', label: 'is not null' },
	{ value: 'gt', label: 'is greater than' },
	{ value: 'gte', label: 'is greater than or equal to' },
	{ value: 'lt', label: 'is less than' },
	{ value: 'lte', label: 'is less than or equal to' },
];

export function getOperators(type: ColumnsType, name: string) {
	const column = getColumns(type).find((column) => column.name === name);
	const columnType = column?.type;
	return columnType
		? columnType === 'string' || columnType === 'email' || columnType === 'text'
			? stringOperators
			: columnType === 'bool'
			? boolOperators
			: columnType === 'multiple'
			? multipleOperators
			: columnType === 'datetime'
			? datetimeOperators
			: columnType === 'int'
			? integerOperators
			: []
		: [];
}
