'use client';
import { ErrorMessage } from '@/app/globalComponents/ErrorMessage';
import { UserAvatar } from '@/app/globalComponents/UserAvatar';
import { User } from '@prisma/client';
import { useRouter } from 'next13-progressbar';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { changeRole } from '../actions';

export type ChangeRoleState = null | {
	success: boolean;
	message: string;
};

export function UserTable({
	myId,
	users: serverUsers,
}: {
	myId?: string;
	users: (User & {
		checked: boolean;
	})[];
}) {
	const router = useRouter();

	const [state, formAction] = useActionState<ChangeRoleState, FormData>(changeRole, null);

	const [users, setUsers] = useState(serverUsers);
	const [search, setSearch] = useState('');
	const [displayUsers, setDisplayUsers] = useState(serverUsers);

	useEffect(() => {
		setDisplayUsers(
			users.filter((user) => {
				const name = user.name as string;
				const email = user.email as string;
				return name.includes(search) || email.includes(search);
			}),
		);
	}, [search, users]);

	const blockUserDialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (state?.success) {
			setUsers(serverUsers);
			blockUserDialogRef.current?.close();
		}
	}, [state, serverUsers]);

	const handleOnChange = (position: number) => {
		const displayUser = displayUsers[position];
		setUsers(
			users.map((user) =>
				user.id === displayUser.id ? { ...user, checked: user.id === myId ? false : !user.checked } : user,
			),
		);
	};
	const handleSelectAll = (checked: boolean) => {
		setUsers(users.map((user) => ({ ...user, checked: user.id === myId ? false : checked })));
	};

	if (!users) return <ErrorMessage code="501" message="There is no users in the database" />;

	return (
		<>
			<main className="flex w-full flex-col items-center gap-4 overflow-auto p-4">
				{users.length < 1 ? (
					<div>Nothing Here</div>
				) : (
					<div className="bg-base-100 border-base-200 shadow-base-200 flex w-full flex-col gap-4 overflow-auto rounded-xl border-2 p-4 shadow-lg">
						<div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
							<h2 className="text-primary sticky left-0 text-center text-xl">Users Management</h2>
							<input
								type="text"
								placeholder="Search Users"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="input input-bordered static right-6 w-full lg:absolute lg:max-w-xs"
							/>
						</div>
						<table className="table">
							<thead>
								<tr>
									<th>
										<label>
											<input
												type="checkbox"
												className="checkbox"
												checked={users.filter((user) => user.id !== myId).every((user) => user.checked)}
												onChange={(event) => handleSelectAll(event.target.checked)}
											/>
										</label>
									</th>
									<th>Name</th>
									<th>Email</th>
									<th>Role</th>
								</tr>
							</thead>
							<tbody>
								{displayUsers.map((user, index) => (
									<tr
										className="hover cursor-pointer"
										key={user.id}
										onClick={(e) => {
											e.preventDefault();
											router.push(`/users/${user.id}`);
										}}
									>
										<th className="cursor-default" onClick={(event) => event.stopPropagation()}>
											<label>
												<input
													type="checkbox"
													className="checkbox"
													disabled={user.id === myId}
													checked={user.checked}
													onChange={() => handleOnChange(index)}
													onClick={(event) => event.stopPropagation()}
												/>
											</label>
										</th>
										<td>
											<div className="flex items-center gap-3">
												<div className="avatar">
													<div className="mask mask-squircle h-12 w-12">
														<UserAvatar
															user={
																user as {
																	id: string;
																	name?: string | null | undefined;
																	email?: string | null | undefined;
																	image?: string | null | undefined;
																}
															}
														/>
													</div>
												</div>
												<div>
													<div className="font-bold">{(user.name as string) ?? 'Unnamed'}</div>
												</div>
											</div>
										</td>
										<td>{(user.email as string) ?? 'No Email'}</td>
										<td>
											{(user.role as string)
												? (user.role as string).charAt(0).toUpperCase() + (user.role as string).slice(1)
												: 'Blocked'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</main>
			<dialog ref={blockUserDialogRef} className="modal">
				<div className="modal-box max-w-4xl">
					<h3 className="text-lg font-bold">Change Users&apos; Role</h3>
					<p className="py-4">
						You will be changing the role of the selected users. This will limit or grant access to certain resources.
					</p>
					<form action={formAction}>
						<input type="hidden" name="users" value={users.filter((user) => user.checked).map(({ id }) => id)} />
						<div className="flex flex-col justify-around sm:flex-row">
							<label className="label flex cursor-pointer flex-row-reverse gap-2 sm:flex-row">
								<input type="radio" name="role" value="blocked" className="radio radio-success" required />
								<span className="label-text">Blocked (Default)</span>
							</label>
							<label className="label flex cursor-pointer flex-row-reverse gap-2 sm:flex-row">
								<input type="radio" name="role" value="admin" className="radio radio-warning" />
								<span className="label-text">Admin</span>
							</label>
							<label className="label flex cursor-pointer flex-row-reverse gap-2 sm:flex-row">
								<input type="radio" name="role" value="view" className="radio radio-error" />
								<span className="label-text">View</span>
							</label>
						</div>
						{state && !state.success && (
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
								<span>{state.message}</span>
							</div>
						)}
						<div className="modal-action">
							<ChangeRoleButton />
						</div>
					</form>
				</div>
				<form id="close_dialog" method="dialog" />
			</dialog>
			{users.some((user) => user.checked) && (
				<div className="sticky bottom-5 z-10 flex w-full justify-center px-4">
					<div className="bg-base-200 border-base-300 flex h-32 w-full flex-col items-center justify-between gap-2 rounded-lg border-2 border-solid p-4 shadow-md sm:h-16 sm:flex-row">
						<span className="flex items-center gap-2">
							<span className="bg-primary flex h-6 w-6 items-center justify-center rounded-md text-white">
								{users.filter((user) => user.checked).length}
							</span>
							Users Selected
						</span>
						<div className="flex h-full items-center justify-center gap-2">
							<button className="btn btn-neutral" onClick={() => handleSelectAll(false)}>
								Cancel
							</button>
							<button className="btn btn-info" onClick={() => blockUserDialogRef.current?.showModal()}>
								Change Role
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function ChangeRoleButton() {
	const { pending } = useFormStatus();

	return (
		<>
			<button className="btn btn-info" type="submit" disabled={pending}>
				{pending ? <span className="loading loading-dots"></span> : 'Change Role'}
			</button>
			<button form="close_dialog" className="btn" disabled={pending}>
				Close
			</button>
		</>
	);
}
