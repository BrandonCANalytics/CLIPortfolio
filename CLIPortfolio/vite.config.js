import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/CLIPortfolio/CLIPortfolio',   // 👈 must match your repo name
})
