import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// const mode = process.env.MODE || 'development';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..'], // Разрешаем доступ к корневой папке ( для доступа к переводам например )
    },
  },
  // define: {
  //   'process.env': {
  //     mode,
  //   },
  // },
});
