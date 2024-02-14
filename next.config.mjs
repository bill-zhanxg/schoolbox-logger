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
				hostname: '*.xata.sh',
			},
		],
	},
	experimental: {
		instrumentationHook: true,
	},
};

export default nextConfig;
