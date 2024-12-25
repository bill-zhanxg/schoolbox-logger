import { auth, signOut } from '@/libs/auth';
import { isView } from '@/libs/checkPermission';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';
import BarOfProgress from './components/BarOfProgress';
import { HandleUserTimezone } from './components/HandleUserTimezone';
import { NavBar } from './components/NavBar';
import { UserAvatar } from './globalComponents/UserAvatar';
import './globals.css';

export const metadata: Metadata = {
	title: 'Schoolbox Logger',
	description: 'A simple tool to keep the history of schoolbox and Azure data.',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html lang="en">
			<body>
				{session ? (
					!isView(session) ? (
						<h1 className="text-2xl">
							Sorry but you do to have access to this site.{' '}
							<Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="link link-primary" target="_blank">
								Click here
							</Link>
						</h1>
					) : (
						<>
							<div className="navbar bg-base-200 border-b-2 border-base-300 shadow-lg shadow-base-300">
								<div className="navbar-start">
									<Link id="home-btn" href="/" className="btn btn-ghost normal-case text-xl">
										<FaHome />
									</Link>
								</div>
								<NavBar session={session} />
								<div className="navbar-end">
									<div className="dropdown dropdown-end">
										<div className="flex items-center h-full">
											<label tabIndex={0} className="btn btn-ghost btn-circle avatar">
												<UserAvatar user={session.user} className="rounded-full" />
											</label>
										</div>
										<ul
											tabIndex={0}
											className="menu menu-md dropdown-content mt-3 z-100 p-2 shadow-xl bg-base-100 rounded-box w-52 border border-primary"
										>
											<li>
												<Link href="/settings">User Settings</Link>
											</li>
											<li>
												<form
													className="menu-title p-0!"
													action={async () => {
														'use server';
														await signOut();
													}}
												>
													<button
														type="submit"
														id="logout-btn"
														className="bg-red-600 hover:bg-red-800 text-white rounded-lg px-4 py-2 text-sm w-full transition duration-200 active:bg-red-950"
													>
														Logout
													</button>
												</form>
											</li>
										</ul>
									</div>
								</div>
							</div>
							{children}
							<BarOfProgress />
							{session.user.auto_timezone && <HandleUserTimezone />}
						</>
					)
				) : (
					children
				)}
			</body>
		</html>
	);
}

/** Non-superuser endpoints
 * Everything in Calendar
 * https://api.schoolbox.com.au/#get-/calendar/event/attendance/-id-
 *
 * Everything in Discussion
 * https://api.schoolbox.com.au/#post-/discussion/-contextType-/-contextId-/threads
 *
 * Everything in File
 * https://api.schoolbox.com.au/#post-/storage/asyncUpload.php
 *
 * Everything in Learning moment
 * https://api.schoolbox.com.au/#post-/learning/evidence/user/-id-/create
 *
 * https://api.schoolbox.com.au/#post-/api/register/-provider-
 *
 * Everything in News
 * https://api.schoolbox.com.au/#post-/news/create
 *
 * Users:
 * https://api.schoolbox.com.au/#get-/api/user/-id-
 * https://api.schoolbox.com.au/#get-/user/token
 *
 * https://api.schoolbox.com.au/#get-/api/curriculum/usage/-id-
 */

/** Superuser endpoints
 * Everything in Assessment
 * https://api.schoolbox.com.au/#get-/api/assessment
 * https://api.schoolbox.com.au/#get-/api/assessment/-id-
 *
 * Users
 * https://api.schoolbox.com.au/#get-/api/user
 * https://api.schoolbox.com.au/#post-/api/user
 * https://api.schoolbox.com.au/#put-/api/user/-id-
 * https://api.schoolbox.com.au/#delete-/api/user/-id-
 * https://api.schoolbox.com.au/#patch-/api/user/-id-
 * https://api.schoolbox.com.au/#get-/api/user/-id-/group
 * https://api.schoolbox.com.au/#get-/api/user/-id-/group/-groupId-
 * https://api.schoolbox.com.au/#put-/api/user/-id-/group/-groupId-
 * https://api.schoolbox.com.au/#post-/api/user/-id-/group/-groupId-
 * https://api.schoolbox.com.au/#delete-/api/user/-id-/group/-groupId-
 * https://api.schoolbox.com.au/#patch-/api/user/-id-/group/-groupId-
 * https://api.schoolbox.com.au/#post-/api/user/-id-/notify
 */
