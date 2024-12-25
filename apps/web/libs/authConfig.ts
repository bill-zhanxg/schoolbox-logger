import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { prisma } from '@repo/database';

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
			allowDangerousEmailAccountLinking: true,
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
	events: {
		createUser: async (message) => {
			// TODO: test
			const { user } = message;
			if (!user.id || !user.email) return;

			const pendingUser = await prisma.pendingUsers.findUnique({
				where: {
					email: user.email,
				},
			});
			if (!pendingUser) return;

			await prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					name: pendingUser.name,
					role: pendingUser.role,
				},
			});

			await prisma.pendingUsers.delete({
				where: {
					id: pendingUser.id,
				},
			});
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
});
