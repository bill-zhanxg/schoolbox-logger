import { FaXmark } from 'react-icons/fa6';

export type AlertType = {
	type: 'success' | 'error';
	message: string;
} | null;

export function ErrorAlertFixed({ message, setAlert }: { message: string; setAlert: (message: null) => void }) {
	return (
		<div className="fixed bottom-3 z-50 w-full px-3">
			<div className="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-8 w-8 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span className="overflow-x-hidden text-xl text-ellipsis">{message}</span>
				<button className="btn btn-error btn-circle" onClick={() => setAlert(null)}>
					<FaXmark className="text-xl" />
				</button>
			</div>
		</div>
	);
}

export function SuccessAlertFixed({ message, setAlert }: { message: string; setAlert: (message: null) => void }) {
	return (
		<div className="fixed bottom-3 z-50 w-full px-3">
			<div className="alert alert-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span className="overflow-x-hidden text-xl text-ellipsis">{message}</span>
				<button className="btn btn-success btn-circle" onClick={() => setAlert(null)}>
					<FaXmark className="text-xl" />
				</button>
			</div>
		</div>
	);
}

export function ErrorAlert({ message }: { message: string }) {
	return (
		<div role="alert" className="alert alert-error">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{message}</span>
		</div>
	);
}

export function SuccessAlert({ message }: { message: string }) {
	return (
		<div role="alert" className="alert alert-success">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{message}</span>
		</div>
	);
}
