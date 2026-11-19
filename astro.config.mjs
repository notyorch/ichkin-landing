import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['lime-server.tail55f307.ts.net'],
    },
  },
});
