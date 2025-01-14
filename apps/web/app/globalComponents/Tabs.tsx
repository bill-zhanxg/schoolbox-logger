export function Tabs({ children, breakPoint = 'sm' }: { children: React.ReactNode; breakPoint?: 'sm' | 'lg' }) {
	return (
		<div
			role="tablist"
			className={`tabs tabs-bordered tabs-lg bg-base-200 border-base-200 shadow-base-200 w-full rounded-xl border-2 shadow-lg ${
				breakPoint === 'sm' ? 'sm:w-auto' : 'lg:w-auto'
			}`}
		>
			{children}
		</div>
	);
}
