import { backendUrl } from '@/libs/formatValue';
import { FaRegTimesCircle } from 'react-icons/fa';
import { z } from 'zod';
import { ManageData } from './components/ManageData';

const StatusSchema = z.object({
	azure: z.boolean(),
	schoolbox: z.boolean(),
});

export default async function LogData() {
	const status:
		| {
				azure: boolean;
				schoolbox: boolean;
		  }
		| string = await fetch(`${backendUrl}status`, {
		headers: {
			Authorization: process.env.AUTH_SECRET,
		},
	})
		.then(async (res) => {
			const data = await res.json();
			const result = StatusSchema.safeParse(data);
			if (!result.success) return `Parsing error: ${result.error.message}`;
			return result.data;
		})
		.catch((err: Error) => err.message || 'Unknown error');

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2 w-full bg-base-100 rounded-xl border-2 border-base-200 shadow-lg shadow-base-200 p-4">
				<h1 className="text-2xl font-bold text-center">Backend Working Status</h1>
				{typeof status === 'string' ? (
					<div role="alert" className="alert alert-error">
						<FaRegTimesCircle size={20} />
						<span>{status}</span>
					</div>
				) : (
					<div className="flex flex-col sm:flex-row items-center justify-around">
						<div className="flex gap-2 items-center">
							<p>Azure Logging Status</p>
							<div className={`badge badge-sm ${status.azure ? 'badge-error' : 'badge-success'}`}></div>
						</div>
						<div className="flex gap-2 items-center">
							<p>Schoolbox Logging Status</p>
							<div className={`badge badge-sm ${status.schoolbox ? 'badge-error' : 'badge-success'}`}></div>
						</div>
					</div>
				)}
			</div>
			<ManageData />
		</div>
	);
}
