import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true,
		proxy: {
			'/auth': 'http://localhost:4000',
			'/company': 'http://localhost:4000',
			'/chatbot': 'http://localhost:4000',
			'/data': 'http://localhost:4000',
			'/training': 'http://localhost:4000'
		}
	}
});