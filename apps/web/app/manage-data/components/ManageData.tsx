'use client';

import { FormState } from '@/libs/types';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { fetchDataForm } from '../actions';

export function ManageData() {
	const [state, formAction] = useActionState<FormState, FormData>(fetchDataForm, null);

	return (
		<form
			className="bg-base-100 border-base-200 shadow-base-200 flex w-full flex-col gap-4 rounded-xl border-2 p-4 shadow-lg"
			action={formAction}
		>
			<div>
				<h1 className="text-center text-2xl font-bold">Data Management</h1>
				<p className="text-error text-center font-bold">UNSTABLE - PLEASE TEST IN DEV DATABASE BEFORE PRODUCTION</p>
			</div>
			<div className="flex w-full flex-col gap-6 lg:flex-row">
				<div className="border-primary shadow-border-primary flex w-full flex-col items-center gap-2 rounded-xl border-2 p-4 shadow-lg">
					<h1 className="font-bold">Azure Logging</h1>
					<p className="text-center">
						Get the most recent change from Azure, current data will be moved to history table, you can get the API keys
						from{' '}
						<Link
							href="https://developer.microsoft.com/en-us/graph/graph-explorer"
							className="link link-primary"
							target="_blank"
						>
							Microsoft Graph
						</Link>
						. The backend will validate the token after the request.
					</p>
					<input type="password" name="azure-token" placeholder="Azure Token" className="input input-bordered w-full" />
					<Submit value="azure">Get Azure Data</Submit>
				</div>
				<div className="border-primary shadow-border-primary flex w-full flex-col items-center gap-2 rounded-xl border-2 p-4 shadow-lg">
					<h1 className="font-bold">Schoolbox Logging</h1>
					<p className="text-center">
						Get the new batches of Schoolbox data (portraits), it will continue to add documents to the portraits table
						without removing the previous batch. DO NOT ENTER WRONG CREDENTIALS
					</p>
					<div className="flex w-full gap-2">
						<input
							type="text"
							name="schoolbox-domain"
							placeholder="Schoolbox Full Domain"
							className="input input-bordered w-full"
						/>
						<input
							type="password"
							name="schoolbox-cookie"
							placeholder="Schoolbox Cookie"
							className="input input-bordered w-full"
						/>
						<input
							type="number"
							name="schoolbox-start-id"
							placeholder="Start ID"
							className="input input-bordered w-1/3"
							defaultValue={0}
						/>
						<input
							type="number"
							name="schoolbox-end-id"
							placeholder="End ID"
							className="input input-bordered w-1/3"
							defaultValue={12642}
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
