import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// Local development config without Netlify adapter
export default defineConfig({
  site: 'https://katchupkitchen.netlify.app/',
  integrations: [tailwind(), sitemap(), react()],
  devOptions: {
    proxy: {
      '/api': 'https://openrouter.ai/api/v1/chat/completions', // This redirects your local requests to the external API
    },
  },
  output: 'static',
}); 