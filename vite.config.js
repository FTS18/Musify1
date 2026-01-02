import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    root: '.', // root is current dir, but index.html will be moved or rewritten
    build: {
        outDir: 'dist',
    }
});
