import { defineConfig, type PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
// import obfuscator from "vite-plugin-javascript-obfuscator";
import { posix } from "path";
import { fileURLToPath, URL } from "node:url";

// const mode = process.env.MODE || 'development';

const tmpPath = posix.join("/src/shared/styles/tmp.scss");

// For desktop (Tauri/Electron): relative base so assets load from file://
const isDesktop =
  process.env.BUILD_ELECTRON === "1" || process.env.BUILD_TAURI === "1";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: isDesktop ? "./" : "/",
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
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB (default 2 MiB; main chunk is ~4 MB)
      },
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
    // Обфускация только для production-сборки (увеличивает размер и время сборки)
    // Не обфусцируем главный бандл (index-*.js) — в нём вызовы import() для lazy-роутов, обфускатор ломает пути
    // mode === "production" &&
    //   (obfuscator({
    //     apply: "build",
    //     exclude: [/node_modules/, /\.css$/, /\/index-[A-Za-z0-9]+\.js$/],
    //     options: {
    //       compact: true,
    //       controlFlowFlattening: false,
    //       deadCodeInjection: false,
    //       debugProtection: false,
    //       disableConsoleOutput: false,
    //       identifierNamesGenerator: "hexadecimal",
    //       log: false,
    //       numbersToExpressions: false,
    //       renameGlobals: false,
    //       selfDefending: false,
    //       simplify: true,
    //       splitStrings: false,
    //       stringArray: true,
    //       stringArrayCallsTransform: false,
    //       stringArrayEncoding: [],
    //       stringArrayIndexShift: true,
    //       stringArrayRotate: true,
    //       stringArrayShuffle: true,
    //       stringArrayWrappersCount: 0,
    //       stringArrayWrappersType: "variable",
    //       stringArrayThreshold: 0.75,
    //       unicodeEscapeSequence: false,
    //     },
    //   }) as PluginOption),
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [".."], // Разрешаем доступ к корневой папке ( для доступа к переводам например )
    },
  },
  watch: {
    ignored: ["**/src-tauri/**"],
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
}));
