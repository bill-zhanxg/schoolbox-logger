'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html>
			<body>
				<div className="flex h-full flex-col items-center justify-center text-center">
					<div className="max-w-xl px-4 sm:px-6 lg:px-8">
						<h1 className="mb-4 text-6xl font-bold">500</h1>
						<p className="text-base-content/100 mb-8 text-2xl">Something seriously went wrong.</p>
						<p className="text-error mb-8 text-lg">{error.message}</p>
						<button
							className="btn btn-primary inline-flex items-center justify-center px-4 py-2"
							onClick={() => reset()}
						>
							Try Again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
