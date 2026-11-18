import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://dave-elkins.github.io',
    trailingSlash: 'always',
    integrations: [sitemap()],
    markdown: {
        shikiConfig: {
            theme: 'github-dark',
            wrap: true,
        },
    },
});
