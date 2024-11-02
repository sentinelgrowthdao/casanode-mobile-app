import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs';
import { defineConfig } from 'vite'

// Check if the qrdata.json file exists
const qrcodePath = path.resolve(__dirname, './src/assets/qrcode.json');
const qrcodeAliasPath = fs.existsSync(qrcodePath) ? qrcodePath : path.resolve(__dirname, './src/assets/qrcode.example.json');

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
			'@services': path.resolve(__dirname, './src/services'),
			'@stores': path.resolve(__dirname, './src/stores'),
			'@interfaces': path.resolve(__dirname, './src/interfaces'),
			'@qrcode.json': qrcodeAliasPath,
		},
	},
	// test: {
	// 	globals: true,
	// 	environment: 'jsdom'
	// }
})
