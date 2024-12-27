import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@repo/database';
import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const authConfig = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'database',
	},
	providers: [
		MicrosoftEntraID({
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
			profilePhotoSize: 648,
		}),
	],
	callbacks: {
		session({ session, user }) {
			if (user) session.user = user;
			return session;
		},
		async signIn({ user }) {
			if (!user.email) return '/login?error=EmailRequired';
			return true;
		},
	},
	pages: {
		signIn: '/login',
	},
	debug: process.env.NODE_ENV === 'development',

	experimental: {
		// TODO: Add support for WebAuthn
		enableWebAuthn: true,
	},

	trustHost: true,
});
