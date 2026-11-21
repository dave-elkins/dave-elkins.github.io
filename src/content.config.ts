import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string(),
        date: z.coerce.date(),
        series: z.string().optional(),
        order: z.number().int().positive().optional(),
        originalUrl: z.url().optional(),
        source: z.enum(['medium', 'blog']).default('blog'),
        tags: z
            .array(
                z.enum([
                    'architecture',
                    'concept-design',
                    'wysiwid',
                    'sync',
                    'legibility',
                    'software-history',
                    'python',
                    'refactoring',
                    'ai',
                ]),
            )
            .default([]),
        draft: z.boolean().default(false),
    }),
});

export const collections = { articles };
