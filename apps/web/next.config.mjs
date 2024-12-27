/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'icotar.com',
			},
			{
				protocol: 'https',
				hostname: 'schoolbox-logger-development.b0509aa67138f77030e8d3fca617e972.r2.cloudflarestorage.com',
			},
			{
				protocol: 'https',
				hostname: 'schoolbox-logger.b0509aa67138f77030e8d3fca617e972.r2.cloudflarestorage.com',
			},
		],
	},
	experimental: {
		cpus: 8,
	},
};

export default nextConfig;
