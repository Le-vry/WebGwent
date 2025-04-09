
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	extensions: ['.svelte', '.svx'],

	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: null
		}),
		
	},
};

export default config;
			
			