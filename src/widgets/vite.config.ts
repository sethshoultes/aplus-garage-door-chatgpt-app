import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/',
  build: {
    outDir: '../../dist/widgets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'service-area-result': resolve(__dirname, 'service-area-result.html'),
        'diagnosis-result': resolve(__dirname, 'diagnosis-result.html'),
        'booking-confirmation': resolve(__dirname, 'booking-confirmation.html'),
      },
    },
  },
  server: {
    port: 4567,
  },
})
