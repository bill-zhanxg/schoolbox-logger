'use client';

import { AlertType, ErrorAlert, SuccessAlert } from '@/app/components/Alert';
import { useState } from 'react';
import { moveUsersToHistory, resetPortraitLogs, resetPortraits, resetUserLogs, resetUsersHistory } from '../actions';

export function Danger() {
	const [userMoveState, setUserMoveState] = useState<AlertType>(null);
	const [userMoveLoading, setUserMoveLoading] = useState(false);
	const [resetUserState, setResetUserState] = useState<AlertType>(null);
	const [resetUserLoading, setResetUserLoading] = useState(false);
	const [resetPortraitState, setResetPortraitState] = useState<AlertType>(null);
	const [resetPortraitLoading, setResetPortraitLoading] = useState(false);
	const [resetUserLogState, setResetUserLogState] = useState<AlertType>(null);
	const [resetUserLogsLoading, setResetUserLogsLoading] = useState(false);
	const [resetPortraitLogState, setResetPortraitLogState] = useState<AlertType>(null);
	const [resetPortraitLogsLoading, setResetPortraitLogsLoading] = useState(false);

	return (
		<div className="join join-vertical xl:join-horizontal [&>button]:btn-error w-full xl:w-auto">
			<button
				className="btn join-item"
				onClick={(event) => (event.currentTarget.nextElementSibling as HTMLDialogElement).showModal()}
			>
				Move All Users to History
			</button>
			<dialog className="modal">
				<div className="modal-box">
					<h3 className="text-error text-lg font-bold">WARNING</h3>
					<p className="py-4">
						You&apos;re about to move all users records to user_history table. This action is irreversible, are you sure
						you want to continue?
					</p>
					{userMoveState && (userMoveState.type === 'error' ? ErrorAlert(userMoveState) : SuccessAlert(userMoveState))}
					<div className="modal-action">
						<button
							className="btn btn-error"
							disabled={userMoveLoading}
							onClick={async () => {
								setUserMoveLoading(true);
								const res = await moveUsersToHistory();
								setUserMoveState(res);
								setUserMoveLoading(false);
							}}
						>
							Yes
						</button>
						<form method="dialog">
							<button className="btn" disabled={userMoveLoading}>
								No
							</button>
						</form>
					</div>
				</div>
			</dialog>
			<button
				className="btn join-item"
				onClick={(event) => (event.currentTarget.nextElementSibling as HTMLDialogElement).showModal()}
			>
				Remove all User History
			</button>
			<dialog className="modal">
				<div className="modal-box">
					<h3 className="text-error text-lg font-bold">WARNING</h3>
					<p className="py-4">
						You&apos;re about to remove all records in user_history. This action is irreversible and should not be used
						unless necessary. Are you sure you want to continue?
					</p>
					{resetUserState &&
						(resetUserState.type === 'error' ? ErrorAlert(resetUserState) : SuccessAlert(resetUserState))}
					<div className="modal-action">
						<button
							className="btn btn-error"
							disabled={resetUserLoading}
							onClick={async () => {
								setResetUserLoading(true);
								const res = await resetUsersHistory();
								setResetUserState(res);
								setResetUserLoading(false);
							}}
						>
							Yes
						</button>
						<form method="dialog">
							<button className="btn" disabled={resetUserLoading}>
								No
							</button>
						</form>
					</div>
				</div>
			</dialog>
			<button
				className="btn join-item"
				onClick={(event) => (event.currentTarget.nextElementSibling as HTMLDialogElement).showModal()}
			>
				Remove all Portraits
			</button>
			<dialog className="modal">
				<div className="modal-box">
					<h3 className="text-error text-lg font-bold">WARNING</h3>
					<p className="py-4">
						You&apos;re about to remove all records in portraits table. This action is irreversible and should not be
						used unless necessary. Are you sure you want to continue?
					</p>
					{resetPortraitState &&
						(resetPortraitState.type === 'error' ? ErrorAlert(resetPortraitState) : SuccessAlert(resetPortraitState))}
					<div className="modal-action">
						<button
							className="btn btn-error"
							disabled={resetPortraitLoading}
							onClick={async () => {
								setResetPortraitLoading(true);
								const res = await resetPortraits();
								setResetPortraitState(res);
								setResetPortraitLoading(false);
							}}
						>
							Yes
						</button>
						<form method="dialog">
							<button className="btn" disabled={resetPortraitLoading}>
								No
							</button>
						</form>
					</div>
				</div>
			</dialog>
			<button
				className="btn join-item"
				onClick={(event) => (event.currentTarget.nextElementSibling as HTMLDialogElement).showModal()}
			>
				Remove all User Logs
			</button>
			<dialog className="modal">
				<div className="modal-box">
					<h3 className="text-error text-lg font-bold">WARNING</h3>
					<p className="py-4">
						You&apos;re about to remove all user logs. This action is irreversible and should not be used unless
						necessary. Are you sure you want to continue?
					</p>
					{resetUserLogState &&
						(resetUserLogState.type === 'error' ? ErrorAlert(resetUserLogState) : SuccessAlert(resetUserLogState))}
					<div className="modal-action">
						<button
							className="btn btn-error"
							disabled={resetUserLogsLoading}
							onClick={async () => {
								setResetUserLogsLoading(true);
								const res = await resetUserLogs();
								setResetUserLogState(res);
								setResetUserLogsLoading(false);
							}}
						>
							Yes
						</button>
						<form method="dialog">
							<button className="btn" disabled={resetUserLogsLoading}>
								No
							</button>
						</form>
					</div>
				</div>
			</dialog>
			<dialog className="modal">
				<div className="modal-box">
					<h3 className="text-error text-lg font-bold">WARNING</h3>
					<p className="py-4">
						You&apos;re about to remove all portrait logs. This action is irreversible and should not be used unless
						necessary. Are you sure you want to continue?
					</p>
					{resetPortraitLogState &&
						(resetPortraitLogState.type === 'error'
							? ErrorAlert(resetPortraitLogState)
							: SuccessAlert(resetPortraitLogState))}
					<div className="modal-action">
						<button
							className="btn btn-error"
							disabled={resetPortraitLogsLoading}
							onClick={async () => {
								setResetPortraitLogsLoading(true);
								const res = await resetPortraitLogs();
								setResetPortraitLogState(res);
								setResetPortraitLogsLoading(false);
							}}
						>
							Yes
						</button>
						<form method="dialog">
							<button className="btn" disabled={resetPortraitLogsLoading}>
								No
							</button>
						</form>
					</div>
				</div>
			</dialog>
			<button
				className="btn join-item"
				onClick={(event) => (event.currentTarget.previousSibling as HTMLDialogElement).showModal()}
			>
				Remove all Portraits Logs
			</button>
		</div>
	);
}
