'use client';

import { dayjs } from '@/libs/dayjs';
import { useEffect } from 'react';
import { setUserTimezone } from './actions';

export function HandleUserTimezone() {
	useEffect(() => {
		setUserTimezone(dayjs.tz.guess());
	}, []);

	return null;
}
