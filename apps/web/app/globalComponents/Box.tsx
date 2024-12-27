export function Box({ children, className = 'flex-col p-4' }: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={`bg-base-200 border-base-300 shadow-base-300 flex w-full rounded-xl border-2 shadow-lg ${className}`}
		>
			{children}
		</div>
	);
}
