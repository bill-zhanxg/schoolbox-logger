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
	daisyui: {
		themes: [
			{
				light: {
					primary: '#2563eb',
					secondary: '#0ea5e9',
					accent: '#4f46e5',
					neutral: '#2b3440',
					'base-100': '#ffffff',
					info: '#3abff8',
					success: '#36d399',
					warning: '#fbbd23',
					error: '#f87272',
				},
				dark: {
					primary: '#5389ff',
					secondary: '#0ea5e9',
					accent: '#4f46e5',
					neutral: '#383f4a',
					'base-100': '#2e3238',
					info: '#3abff8',
					success: '#36d399',
					warning: '#fbbd23',
					error: '#f87272',
				},
			},
		],
	},
	plugins: [daisyui],
};
export default config;
