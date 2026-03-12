import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	build: {
		// Enable minification and optimizations
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: false, // Set to true in production to remove console logs
			},
		},
		// Chunk size and code splitting optimizations
		rollupOptions: {
			output: {
				// Manual chunk optimization
				manualChunks: {
					'highlight': ['highlight.js'],
					'skeleton': ['@skeletonlabs/skeleton'],
				},
			},
		},
		// Target modern browsers for better compression
		target: 'ES2020',
		// Enable sourcemaps for debugging in production (optional)
		sourcemap: false,
	},
	// Performance optimizations
	optimizeDeps: {
		include: ['@sveltejs/kit', '@skeletonlabs/skeleton'],
	},
});