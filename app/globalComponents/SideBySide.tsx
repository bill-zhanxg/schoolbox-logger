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
		<span className="flex flex-col sm:flex-row justify-between gap-2 w-full">
			<h4 className={`${fontSize} font-bold text-nowrap`}>{title}</h4>
			<p className={fontSize}>{value}</p>
		</span>
	);
}
