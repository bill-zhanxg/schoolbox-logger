import { InputHTMLAttributes, useEffect, useState } from 'react';

export function DebouncedInput({
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
