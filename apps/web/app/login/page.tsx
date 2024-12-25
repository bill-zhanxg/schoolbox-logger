import { auth, signIn } from '@/libs/auth';
import { redirect } from 'next/navigation';

type ErrorCodes =
	| 'OAuthSignin'
	| 'OAuthCallback'
	| 'OAuthCreateAccount'
	| 'EmailCreateAccount'
	| 'Callback'
	| 'OAuthAccountNotLinked'
	| 'EmailSignin'
	| 'CredentialsSignin'
	| 'SessionRequired'
	| 'Default';

export default async function Login(props: {
	searchParams: Promise<{
		redirect: string | string[] | undefined;
		error: ErrorCodes | string | string[] | undefined;
		message: string | string[] | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const callbackURL = typeof searchParams.redirect === 'string' ? searchParams.redirect : searchParams.redirect?.[0];

	const session = await auth();
	if (session) return redirect(decodeURIComponent(callbackURL ?? '/'));

	return (
		<div className="flex h-full flex-col items-center justify-center gap-3">
			<h1 className="p-5 text-center text-4xl font-bold">Schoolbox Logger Login (Authorized access only)</h1>
			<form
				className="w-4/5 max-w-[20rem]"
				action={async () => {
					'use server';
					await signIn('microsoft-entra-id');
				}}
			>
				<button type="submit" className="btn btn-primary w-full">
					Login with Microsoft
				</button>
			</form>
			{/* Error */}
			{(searchParams.message || searchParams.error) && (
				<div className="alert alert-error w-4/5 max-w-[20rem]">
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
					<span>Error: {searchParams.message || getMessages(searchParams.error)}</span>
				</div>
			)}
		</div>
	);
}

function getMessages(error: ErrorCodes | string | string[] | undefined) {
	switch (error) {
		case 'OAuthSignin':
			return 'Error in constructing an authorization URL.';
		case 'OAuthCallback':
			return 'Error in handling the response from an OAuth provider.';
		case 'OAuthCreateAccount':
			return 'Could not create OAuth provider user in the database.';
		case 'EmailCreateAccount':
			return 'Could not create email provider user in the database.';
		case 'Callback':
			return 'Error in the OAuth callback handler route.';
		case 'OAuthAccountNotLinked':
			return 'The email on the account is already linked, but not with this OAuth account.';
		case 'EmailSignin':
			return 'Sending the e-mail with the verification token failed.';
		case 'CredentialsSignin':
			return 'The authorize callback returned null in the Credentials provider.';
		case 'SessionRequired':
			return 'The content of this page requires you to be signed in at all times.';
		default:
			return 'Unexpected error.';
	}
}
