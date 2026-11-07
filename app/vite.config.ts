import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the project site from /vue-monster-game/.
  base: '/vue-monster-game/',
  // TEMPORARY (until phase 4): serve the legacy images straight from ../resources instead of
  // copying 30 MB into app/. Files are available at <base><path>, e.g. <base>monster-images/hq/001.png.
  // The build copies them into dist/ too, which the (manual) deploy needs anyway.
  // All URLs are built in src/assets.ts, so phase 4 (WebP, srcset) only changes that file.
  publicDir: '../resources',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Two projects, same isolation (every file still gets its own worker): files that never
    // touch the DOM run in plain Node, which saves creating a happy-dom for each of them.
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/domain/**/*.spec.ts',
            'src/data/**/*.spec.ts',
            'src/ui/**/*.spec.ts',
            'src/animation/keyframes.spec.ts',
            'src/styles/**/*.spec.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.spec.ts'],
          exclude: [
            'src/domain/**',
            'src/data/**',
            'src/ui/**',
            'src/animation/keyframes.spec.ts',
            'src/styles/**',
            '**/node_modules/**',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/**/*.d.ts'],
      reporter: ['text', 'json-summary'],
    },
  },
})
