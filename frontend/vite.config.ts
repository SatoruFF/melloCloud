import { defineConfig, type PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import { posix } from "path";

// const mode = process.env.MODE || 'development';

const tmpPath = posix.join("/src/shared/styles/tmp.scss");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: "treemap", // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "analyse.html", // will be saved in project's root
    }) as PluginOption,
    svgr(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Mello",
        short_name: "Mello",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    fs: {
      allow: [".."], // Разрешаем доступ к корневой папке ( для доступа к переводам например )
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: `@use "${tmpPath}" as *;`, // global scss templates import
      },
    },
  },
  define: {
    NODE_ENV: JSON.stringify("development"),
    API_URL: JSON.stringify("http://localhost:8000"),
    SHELL: JSON.stringify("frontend"),
  },
});
