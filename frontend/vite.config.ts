import { defineConfig, type PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';

// const mode = process.env.MODE || 'development';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: 'treemap', // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'analyse.html', // will be saved in project's root
    }) as PluginOption,
  ],
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "./src/shared/styles/tmp.scss";`, // global scss templates import
  //     },
  //   },
  // },
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
