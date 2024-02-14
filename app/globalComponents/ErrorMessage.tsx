import Link from 'next/link';

export function ErrorMessage({ code, message }: { code: string; message: string }) {
	return (
		<div className="flex justify-center items-center h-full">
			<div className="flex flex-col justify-center items-center w-full max-w-sm">
				<div className="flex justify-center items-center flex-row w-full py-4">
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
