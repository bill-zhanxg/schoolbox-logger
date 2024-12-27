export function SideBySide({
	title,
	value,
	fontSize = 'text-lg',
}: {
	title: string;
	value: string;
	fontSize?: string;
}) {
	return (
		<span className="flex w-full flex-col justify-between gap-2 sm:flex-row">
			<h4 className={`${fontSize} font-bold text-nowrap`}>{title}</h4>
			<p className={fontSize}>{value}</p>
		</span>
	);
}
