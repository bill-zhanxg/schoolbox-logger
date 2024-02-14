export function Tabs({ children, breakPoint = 'sm' }: { children: React.ReactNode; breakPoint?: 'sm' | 'lg' }) {
	return (
		<div
			role="tablist"
			className={`tabs tabs-bordered tabs-lg bg-base-200 rounded-xl border-2 border-base-200 shadow-lg shadow-base-200 w-full ${
				breakPoint === 'sm' ? 'sm:w-auto' : 'lg:w-auto'
			}`}
		>
			{children}
		</div>
	);
}
