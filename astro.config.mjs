// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mofatizi.blog',
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,
  build: {
    format: 'directory',
    assets: '_astro',
    inlineStylesheets: 'auto',
  },
  vite: {
    // @ts-ignore Tailwind Vite plugin vs Astro bundled Vite types
    plugins: [tailwindcss()],
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
    port: 4324,
  },
});
