import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed define: { 'process.env': {} } to allow access to window.process shim 
  // and real environment variables injected by the hosting provider.
});