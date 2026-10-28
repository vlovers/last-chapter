import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        'phaser-prototype': resolve(import.meta.dirname, 'phaser-prototype/index.html'),
      },
    },
  },
});
