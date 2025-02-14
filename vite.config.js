import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
import legacy from '@vitejs/plugin-legacy';
export default defineConfig({
  base: './',
  plugins: [
    // legacy({
    //   targets: ['defaults', 'not IE 11']
    // }),
    vue(),
  ],
  server: {
    port: 8890,
    cors: true, // 允许跨域
    hmr: true, // 开启热更新
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css:{
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/style/scssConfig.scss";`
      }
    }
  },
})
