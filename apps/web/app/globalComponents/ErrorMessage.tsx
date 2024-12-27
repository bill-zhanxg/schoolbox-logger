import Link from 'next/link';

export function ErrorMessage({ code, message }: { code: string; message: string }) {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="flex w-full max-w-sm flex-col items-center justify-center">
				<div className="flex w-full flex-row items-center justify-center py-4">
					<h1 className="text-2xl font-bold">{code}</h1>
					<div className="divider divider-horizontal"></div>
					<h1 className="text-xl font-semibold">{message}</h1>
				</div>
				<Link href="/" className="btn btn-primary w-full">
					Back to Home
				</Link>
			</div>
		</div>
	);
}
