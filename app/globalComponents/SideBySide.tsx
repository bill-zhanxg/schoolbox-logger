export function SideBySide({ title, value }: { title: string; value: string }) {
	return (
		<span className="flex flex-col sm:flex-row justify-between gap-2 w-full">
			<h4 className="text-lg font-bold text-nowrap">{title}</h4>
			<p className="text-lg">{value}</p>
		</span>
	);
}
