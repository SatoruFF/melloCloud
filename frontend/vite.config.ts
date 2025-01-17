import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// const mode = process.env.MODE || 'development';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // define: {
  //   'process.env': {
  //     mode,
  //   },
  // },
});
