import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
    const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
        (a, b) => b.data.date.getTime() - a.data.date.getTime(),
    );

    return rss({
        title: 'Dave Elkins',
        description: 'Writing on software design, legibility, healthcare engineering, and WYSIWID.',
        site: context.site ?? 'https://dave-elkins.github.io',
        items: articles.map((entry) => ({
            title: entry.data.title,
            description: entry.data.description,
            pubDate: entry.data.date,
            link: `/writing/${entry.id}/`,
            content: entry.body ?? '',
        })),
    });
}
