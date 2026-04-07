import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unfonts from "unplugin-fonts/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    visualizer(),
    Unfonts({
      google: {
        families: [
          {
            name: "Chakra Petch",
            styles: "wght@400;500;700;900",
            defer: true,
          },
          {
            name: "Rubik",
            styles: "wght@400;500;700;900",
            defer: true,
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
