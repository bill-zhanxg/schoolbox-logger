import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config & {
	daisyui?: {
		themes?: boolean | any[];
		darkTheme?: string;
		base?: boolean;
		styled?: boolean;
		utils?: boolean;
		prefix?: string;
		logs?: boolean;
		themeRoot?: string;
	};
} = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		screens: {
			xs: '300px',
			...defaultTheme.screens,
		},
	},
	plugins: [daisyui],
};
export default config;
