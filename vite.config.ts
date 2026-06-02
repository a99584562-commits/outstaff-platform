import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages repo path
export default defineConfig({
  plugins: [react()],
  base: '/outstaff-platform/',
})
