import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // カスタムドメイン ps7.co.jp 使用のため '/' 固定
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
