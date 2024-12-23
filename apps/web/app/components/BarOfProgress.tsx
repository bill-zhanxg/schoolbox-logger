'use client';

import { Next13ProgressBar } from 'next13-progressbar';

const BarOfProgress = () => {
	return <Next13ProgressBar height="4px" color="#2563eb" options={{ showSpinner: false }} delay={100} showOnShallow />;
};

export default BarOfProgress;
