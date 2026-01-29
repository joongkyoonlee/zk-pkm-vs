import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // ✅ GitHub Pages 배포용 base
  base: '/zk-pkm-vs/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  define: {
    __VITE_NOTION_REDIRECT_URI__: JSON.stringify(
      process.env.VITE_NOTION_REDIRECT_URI || 'https://cdsa.kr'
    ),
  },
})
