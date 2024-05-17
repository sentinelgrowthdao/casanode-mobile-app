import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		legacy()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@locales': path.resolve(__dirname, './src/locales'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@components': path.resolve(__dirname, './src/components'),
			'@views': path.resolve(__dirname, './src/views'),
			'@scss': path.resolve(__dirname, './src/scss'),
			'@stores': path.resolve(__dirname, './src/stores'),
		},
	},
	// test: {
	// 	globals: true,
	// 	environment: 'jsdom'
	// }
})
