import reactCompiler from 'eslint-plugin-react-compiler';
import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
	{
		extends: [...nextCoreWebVitals],

		plugins: {
			'react-compiler': reactCompiler,
		},

		rules: {
			'react-compiler/react-compiler': 'error',
		},
	},
]);
