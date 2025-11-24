import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures that if the code refers to process.env.API_KEY, 
    // it doesn't crash in the browser, although we rely on the shim in index.html for the actual value in this specific setup.
    'process.env': {} 
  }
});