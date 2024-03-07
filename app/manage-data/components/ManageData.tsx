'use client';

import { FormState } from '@/libs/types';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { fetchDataForm } from '../actions';

export function ManageData() {
	const [state, formAction] = useFormState<FormState, FormData>(fetchDataForm, null);

	return (
		<div className="p-6">
			<form
				className="flex flex-col gap-4 w-full bg-base-100 rounded-xl border-2 border-base-200 shadow-lg shadow-base-200 p-4"
				action={formAction}
			>
				<h1 className="text-2xl font-bold text-center">Data Management</h1>
				<div className="flex flex-col lg:flex-row gap-6 w-full">
					<div className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary shadow-lg shadow-border-primary p-4 w-full">
						<h1 className="font-bold">Azure Logging</h1>
						<p className="text-center">
							Get the most recent change from Azure, current data will be moved to history table, you can get the API
							keys from{' '}
							<Link
								href="https://developer.microsoft.com/en-us/graph/graph-explorer"
								className="link link-primary"
								target="_blank"
							>
								Microsoft Graph
							</Link>
						</p>
						<input type="text" name="azure-token" placeholder="Azure Token" className="input input-bordered w-full" />
						<Submit value="azure">Get Azure Data</Submit>
					</div>
					<div className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary shadow-lg shadow-border-primary p-4 w-full">
						<h1 className="font-bold">Schoolbox Logging</h1>
						<p className="text-center">
							Get the new batches of Schoolbox data (portraits), it will continue to add documents to the portraits
							table without removing the previous batch
						</p>
						<div className="flex gap-2 w-full">
							<input
								type="text"
								name="schoolbox-domain"
								placeholder="Schoolbox Full Domain"
								className="input input-bordered w-full"
							/>
							<input
								type="text"
								name="schoolbox-cookie"
								placeholder="Schoolbox Cookie"
								className="input input-bordered w-full"
							/>
						</div>
						<Submit value="schoolbox">Get Schoolbox Data</Submit>
					</div>
				</div>
				<Submit value="all">Get All Data</Submit>
				{state && (
					<div role="alert" className={`alert ${state.success ? 'alert-success' : 'alert-error'}`}>
						{state.success ? <FaRegCheckCircle size={20} /> : <FaRegTimesCircle size={20} />}
						<span>{state?.message}</span>
					</div>
				)}
			</form>
		</div>
	);
}

function Submit({ children, value }: { children: React.ReactNode; value: string }) {
	const { pending } = useFormStatus();

	return (
		<button type="submit" disabled={pending} className="btn w-full" name="button" value={value}>
			{children}
		</button>
	);
}
