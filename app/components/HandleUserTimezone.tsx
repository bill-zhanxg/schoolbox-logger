'use client';

import { dayjs } from '@/libs/dayjs';
import { useEffect } from 'react';
import { setUserTimezone } from './actions';

export function HandleUserTimezone() {
	useEffect(() => {
		(async () => {
			const refresh = await setUserTimezone(dayjs.tz.guess());
			if (refresh) window.location.reload();
		})();
	}, []);

	return null;
}
