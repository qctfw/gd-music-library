import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [
		require('@savaryna/tailwindcss-material-symbols'),
		require('@tailwindcss/forms'),
	],
}
