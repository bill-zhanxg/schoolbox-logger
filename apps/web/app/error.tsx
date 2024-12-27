'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="flex w-full max-w-xl flex-col items-center justify-center">
				<div className="flex w-full flex-col items-center justify-center gap-2 py-4 text-center">
					<h1 className="text-2xl font-bold">An error occurred while trying to load the page</h1>
					<h2 className="text-error text-xl font-semibold">{error.message}</h2>
				</div>
				<button
					className="btn btn-primary w-full"
					onClick={(e) => {
						e.preventDefault();
						reset();
					}}
				>
					Try Again
				</button>
			</div>
		</div>
	);
}
