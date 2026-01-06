import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist/widgets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'service-area-result': resolve(__dirname, 'service-area-result.html'),
      },
    },
  },
  server: {
    port: 4567,
  },
})
