'use client';

import { Session } from 'next-auth';
import Link from 'next/link';
import { FaBars } from 'react-icons/fa';

type Menu = {
	id: string;
	name: string;
	href: string | { id: string; name: string; href: string; admin?: boolean }[];
	admin?: boolean;
}[];
const menu: Menu = [
	{
		id: 'test-1-btn',
		name: 'test-1',
		href: '/test-1',
	},
	{
		id: 'admin-control-btn',
		name: 'Admin Controls',
		admin: true,
		href: [
			{
				id: 'users-btn',
				name: 'Users',
				href: '/users',
			},
			{
				id: 'manage-data-btn',
				name: 'Manage Data',
				href: '/manage-data',
			},
		],
	},
];

export function NavBar({ session }: { session: Session }) {
	function handleMobileLiClick() {
		const element = document.activeElement;
		if (element && 'blur' in element) {
			(element as HTMLElement).blur();
		}
	}

	const menuFiltered =
		session.user.role === 'admin'
			? menu
			: menu
					.filter((item) => !item.admin)
					.map((item) =>
						Array.isArray(item.href) ? { ...item, href: item.href.filter((item) => !item.admin) } : item,
					);

	return (
		<>
			<div className="dropdown w-full sm:w-0">
				<label tabIndex={0} className="btn btn-ghost sm:hidden w-full">
					<FaBars />
				</label>
				<ul
					id="mobile-menu"
					tabIndex={0}
					className="menu menu-md dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box border border-primary w-full"
				>
					{menuFiltered.map((item) =>
						Array.isArray(item.href) ? (
							<li key={item.id}>
								<a id={item.id + '-mobile'}>{item.name}</a>
								<ul className="p-2">
									{item.href.map((item) => (
										<li key={item.id}>
											<Link id={item.id + '-mobile'} href={item.href} onClick={handleMobileLiClick}>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</li>
						) : (
							<li key={item.id}>
								<Link id={item.id + '-mobile'} href={item.href} onClick={handleMobileLiClick}>
									{item.name}
								</Link>
							</li>
						),
					)}
				</ul>
			</div>
			<div className="navbar-center hidden sm:flex">
				<ul className="menu menu-horizontal px-1 z-[100]">
					{menuFiltered.map((item) =>
						Array.isArray(item.href) ? (
							<li key={item.id}>
								<details>
									<summary id={item.id}>{item.name}</summary>
									<ul className="p-2 border border-primary">
										{item.href.map((item) => (
											<li className="w-36" key={item.id}>
												<Link
													id={item.id}
													href={item.href}
													onClick={(event) => {
														const details = event.currentTarget.parentElement?.parentElement
															?.parentElement as HTMLDetailsElement;
														details.open = false;
													}}
												>
													{item.name}
												</Link>
											</li>
										))}
									</ul>
								</details>
							</li>
						) : (
							<li key={item.id}>
								<Link id={item.id} href={item.href}>
									{item.name}
								</Link>
							</li>
						),
					)}
				</ul>
			</div>
		</>
	);
}
