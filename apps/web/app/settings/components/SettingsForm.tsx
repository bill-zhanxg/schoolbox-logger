'use client';

import { dayjs } from '@/libs/dayjs';
import { FormState } from '@/libs/types';
import { Session } from 'next-auth';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { Box } from '../../globalComponents/Box';
import { updateProfile } from '../actions';
import { ProfilePicture } from './ProfilePicture';

export function SettingsForm({ session }: { session: Session }) {
	const [state, formAction] = useActionState<FormState, FormData>(updateProfile, null);

	const prevState = useRef(state);
	useEffect(() => {
		if (prevState.current !== state) {
			window.scrollTo({
				top: document.body.scrollHeight,
			});
			prevState.current = state;
		}
	}, [state]);

	const [autoTimezone, setAutoTimezone] = useState(session.user.auto_timezone ?? true);

	return (
		<form className="flex w-full flex-col gap-4" action={formAction}>
			<Box>
				<h1 className="px-4 font-bold">Profile Settings</h1>
				<div className="divider m-0"></div>
				<div className="flex w-full flex-col items-center justify-center gap-4 p-4 pt-0 sm:flex-row">
					{/* Input Name */}
					<div className="flex w-full basis-3/4 flex-col justify-center">
						<label className="form-control w-full">
							<div className="label">
								<span className="label-text text-md font-bold">Name</span>
							</div>
							<input
								type="text"
								placeholder="Type here"
								defaultValue={session.user.name ?? ''}
								name="name"
								className="input input-bordered w-full"
							/>
						</label>
						<label className="form-control w-full">
							<div className="label">
								<span className="label-text text-md font-bold">Email</span>
							</div>
							<input
								type="email"
								placeholder="Type here"
								defaultValue={session.user.email ?? ''}
								name="email"
								className="input input-bordered w-full"
							/>
						</label>
					</div>

					{/* Add profile upload */}
					<div className="flex h-full basis-1/4 items-center justify-center">
						<label className="form-control relative! mt-4">
							<div className="label">
								<span className="label-text text-md text-center font-bold">Profile picture</span>
							</div>
							<ProfilePicture user={session.user} />
						</label>
					</div>
				</div>
			</Box>

			<Box>
				<h1 className="px-4 pt-4 font-bold">Timezone</h1>
				<div className="divider m-0"></div>
				<div className="flex w-full flex-col items-center justify-center gap-4 p-4 pt-0 sm:flex-row">
					<label className="form-control flex w-full flex-col gap-2">
						<div className="form-control">
							<label className="label flex cursor-pointer gap-2">
								<input
									type="checkbox"
									name="auto_timezone"
									checked={autoTimezone}
									className="checkbox"
									onChange={(e) => setAutoTimezone(e.target.checked)}
								/>
								<span className="label-text">Automatically detect timezone (default)</span>
							</label>
						</div>
						<div className="label">
							<span className="label-text">Pick Your Timezone</span>
						</div>
						<select
							name="timezone"
							className="select select-bordered"
							defaultValue={session.user.timezone ?? dayjs.tz.guess()}
							disabled={autoTimezone}
						>
							{Intl.supportedValuesOf('timeZone').map((tz) => (
								<option key={tz} value={tz}>
									{tz}
								</option>
							))}
						</select>
					</label>
				</div>
			</Box>

			{state && (
				<div role="alert" className={`alert ${state.success ? 'alert-success' : 'alert-error'} mt-2`}>
					{state.success ? <FaRegCheckCircle size={20} /> : <FaRegTimesCircle size={20} />}
					<span>{state?.message}</span>
				</div>
			)}
			<Submit />
		</form>
	);
}

function Submit() {
	const { pending } = useFormStatus();

	return (
		<button type="submit" disabled={pending} className="btn btn-primary sticky bottom-2">
			Update Profile
		</button>
	);
}
