'use server';
import { auth } from '@/libs/auth';
import { FormState } from '@/libs/types';
import { prisma } from '@repo/database';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { z } from 'zod';

const schema = z.object({
	name: z.string().min(1).max(200).nullish(),
	email: z.string().min(1).max(200).email().optional(),
	avatar: z.nullable(
		z
			.instanceof(File)
			.refine((file) => file.type.startsWith('image/') || file.type === 'application/octet-stream', {
				message: 'The thumbnail must be an image',
			})
			.transform((file) => (file.type === 'application/octet-stream' ? null : file)),
	),
	auto_timezone: z.literal('on').or(z.boolean()).nullish(),
	timezone: z
		.string()
		.min(1)
		.max(200)
		.refine((timezone) => Intl.supportedValuesOf('timeZone').includes(timezone))
		.nullish(),
});

export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	if (!session) return { success: false, message: 'Unauthorized' };

	const parse = schema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		avatar: formData.get('avatar'),
		team: formData.get('team'),
		reset_only_after_visit_weekly_sport: formData.get('reset_only_after_visit_weekly_sport'),
		auto_timezone: formData.get('auto_timezone'),
		timezone: formData.get('timezone'),
	});

	if (!parse.success) return { success: false, message: parse.error.errors[0].message };
	const { avatar, ...data } = parse.data;

	let image: string | undefined = undefined;
	if (avatar) {
		// Result need to be below 204800 bytes
		const result = await sharp(await avatar.arrayBuffer())
			.resize(1000, 1000)
			.withMetadata()
			.toBuffer();
		image = `data:${avatar.type};base64,${result.toString('base64')}`;
	}

	if (data.auto_timezone === 'on') {
		data.auto_timezone = true;
		delete data.timezone;
	} else {
		if (!data.timezone) data.auto_timezone = true;
		else data.auto_timezone = false;
	}

	try {
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				...data,
				auto_timezone: data.auto_timezone,
				image,
			},
		});
	} catch (e) {
		return { success: false, message: 'Failed to update profile' };
	}

	revalidatePath('/settings');
	return {
		success: true,
		message: 'Profile updated successfully',
	};
}
