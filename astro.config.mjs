// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://origami-z.github.io',
  base: '/blog',
  integrations: [mdx(), sitemap(), react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
