#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const siteRoot = process.cwd();
const blogRoot = process.env.BLOG_SOURCE ?? path.resolve(siteRoot, '../blog');
const outputDir = path.join(siteRoot, 'src/content/articles');

const sourceSeries = [
    { key: 'legible-by-design-the-long-search', dir: 'legible-by-design-the-long-search' },
    { key: 'wysiwid-petstore', dir: 'wysiwid-petstore' },
];

const mediumToSlug = {
    'https://medium.com/@daveelkins/why-your-codebase-is-hard-to-change-and-what-the-field-has-been-getting-wrong-for-decades-64e190354198':
        'intro-why-your-codebase-is-hard-to-change',
    'https://medium.com/@daveelkins/the-machine-doesnt-care-0b9a96499c74': 'machines-dont-care',
    'https://medium.com/@daveelkins/the-first-legibilists-24213c2d3119': 'the-first-legibilists',
    'https://medium.com/@daveelkins/mvc-and-the-original-sin-6b9d5ca1a25a': 'mvc-original-sin',
    'https://medium.com/@daveelkins/objects-were-supposed-to-fix-this-e3a96cde2f31':
        'objects-supposed-to-fix-this',
    'https://medium.com/@daveelkins/dci-the-diagnosis-was-right-the-cure-didnt-take-0d294dfde155':
        'dci',
    'https://medium.com/@daveelkins/the-patterns-movement-36ad5aa9272c': 'patterns-movement',
    'https://medium.com/@daveelkins/hexagonal-slices-and-the-architecture-wars-1a117fe839e8':
        'hexagonal-slices-architecture-wars',
    'https://medium.com/@daveelkins/why-your-features-keep-breaking-each-other-0a3412cfa20a':
        'why-features-break',
    'https://medium.com/@daveelkins/what-is-a-concept-designing-the-pet-store-before-writing-a-line-2471163067e1':
        'what-is-a-concept',
    'https://medium.com/@daveelkins/your-first-wysiwid-concept-pet-in-python-1ad4e62a9375':
        'first-concept-pet',
    'https://medium.com/@daveelkins/concepts-dont-talk-to-each-other-the-sync-engine-ded09cf2f777':
        'sync-engine',
    'https://medium.com/@daveelkins/guards-prohibitions-and-business-rules-that-actually-live-somewhere-b263fdaacf42':
        'guards-and-compensation',
};

const removedHeadings = new Set([
    '## Series Contents',
    '## AI Usage Disclosure',
    "## Let's Build Something Together",
]);

const quote = (value) => JSON.stringify(value);

function gitDate(relativePath) {
    try {
        const output = execFileSync(
            'git',
            ['-C', blogRoot, 'log', '--diff-filter=A', '--format=%aI', '--', relativePath],
            { encoding: 'utf8' },
        ).trim();
        const dates = output.split('\n').filter(Boolean);
        const date = dates.at(-1);
        return date ? date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    } catch {
        return new Date().toISOString().slice(0, 10);
    }
}

function slugify(filename) {
    return filename.replace(/^\d+-/, '').replace(/\.md$/, '');
}

function parseSourceFile(filePath, seriesKey) {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    const titleLine = lines.findIndex((line) => /^#\s+/.test(line));
    if (titleLine === -1) throw new Error(`No H1 found in ${filePath}`);
    const title = lines[titleLine].replace(/^#\s+/, '').trim();

    let subtitle;
    let firstContentLine = titleLine + 1;
    if (lines[firstContentLine]?.trim() === '') firstContentLine += 1;
    const candidate = lines[firstContentLine] ?? '';
    const isSubtitle =
        (/^\*[^*]+\*\s*$/.test(candidate) || /^_[^_]+_\s*$/.test(candidate)) &&
        !candidate.includes('**');
    if (isSubtitle) {
        subtitle = candidate
            .replace(/^\*|\*$/g, '')
            .replace(/^_|_$/g, '')
            .trim();
        firstContentLine += 1;
    }

    const paragraph = [];
    for (let i = firstContentLine; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (line === '' && paragraph.length) break;
        if (line === '' || line === '---' || line.startsWith('#')) continue;
        paragraph.push(line);
    }
    const rawDescription = paragraph
        .join(' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    let description = rawDescription;
    if (description.length > 180) {
        description = description.slice(0, 180);
        description = description.slice(0, description.lastIndexOf(' ')).trimEnd() + '…';
    }

    const filename = path.basename(filePath);
    return {
        series: seriesKey,
        order: Number(filename.match(/^(\d+)-/)?.[1] ?? 0),
        slug: slugify(filename),
        filename,
        title,
        subtitle,
        description,
        body: lines.slice(titleLine + 1).join('\n'),
        relativePath: path.relative(blogRoot, filePath),
    };
}

function stripRepeatedSections(body, subtitle) {
    const output = [];
    let skipping = false;
    let subtitleRemoved = !subtitle;
    for (const line of body.split(/\r?\n/)) {
        if (
            !subtitleRemoved &&
            (line.trim() === `*${subtitle}*` || line.trim() === `_${subtitle}_`)
        ) {
            subtitleRemoved = true;
            continue;
        }
        if (removedHeadings.has(line.trim())) {
            skipping = true;
            continue;
        }
        if (skipping) {
            if (/^##\s+/.test(line.trim())) {
                skipping = false;
            } else {
                continue;
            }
        }
        if (/^_(?:Previous|Next|Next up|Full series index):/i.test(line.trim())) continue;
        output.push(line);
    }
    return output
        .join('\n')
        .replace(/^\s*\n+/, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function rewriteLinks(body, article, all) {
    const byFilename = new Map(all.map((item) => [item.filename, item]));
    const byOrder = new Map(
        all.filter((item) => item.series === article.series).map((item) => [item.order, item]),
    );
    const next = byOrder.get(article.order + 1);
    const previous = byOrder.get(article.order - 1);

    let output = body.replace(/\]\(\.\/([^)]+)\.md\)/g, (_match, target) => {
        const hit = byFilename.get(path.basename(target) + '.md');
        return hit ? `](/writing/${hit.slug}/)` : `](/writing/${slugify(target)}/)`;
    });

    for (const [url, slug] of Object.entries(mediumToSlug)) {
        output = output.split(url).join(`/writing/${slug}/`);
    }

    output = output.replace(
        'https://doi.org/10.2168/lmcs-9(4:23)2013',
        '<https://doi.org/10.2168/lmcs-9(4:23)2013>',
    );

    return output
        .split('\n')
        .map((line) => {
            if (!line.includes('](#)')) return line;
            let target = `/series/${article.series}/`;
            if (/next up|next:/i.test(line) && next) target = `/writing/${next.slug}/`;
            else if (/previous/i.test(line) && previous) target = `/writing/${previous.slug}/`;
            return line.replaceAll('](#)', `](${target})`);
        })
        .join('\n');
}

function frontmatter(article, originalUrl) {
    const lines = ['---', `title: ${quote(article.title)}`];
    if (article.subtitle) lines.push(`subtitle: ${quote(article.subtitle)}`);
    lines.push(
        `description: ${quote(article.description)}`,
        `date: ${gitDate(article.relativePath)}`,
        `series: ${quote(article.series)}`,
        `order: ${article.order}`,
    );
    if (originalUrl) {
        lines.push(`originalUrl: ${quote(originalUrl)}`, `source: "medium"`);
    }
    lines.push('tags: []', 'draft: false', '---', '');
    return lines.join('\n');
}

function main() {
    if (!fs.existsSync(blogRoot)) throw new Error(`Blog source not found: ${blogRoot}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const all = [];
    for (const { key, dir } of sourceSeries) {
        const sourceDir = path.join(blogRoot, 'series', dir);
        for (const filename of fs.readdirSync(sourceDir).sort()) {
            if (!/^\d+-.*\.md$/.test(filename)) continue;
            all.push(parseSourceFile(path.join(sourceDir, filename), key));
        }
    }

    all.sort((a, b) => a.series.localeCompare(b.series) || a.order - b.order);

    for (const article of all) {
        const originalUrl = Object.entries(mediumToSlug).find(
            ([, slug]) => slug === article.slug,
        )?.[0];
        const body = rewriteLinks(
            stripRepeatedSections(article.body, article.subtitle),
            article,
            all,
        );
        const output = `${frontmatter(article, originalUrl)}${body}\n`;
        fs.writeFileSync(path.join(outputDir, `${article.slug}.md`), output, 'utf8');
        console.log(`wrote ${article.slug}.md`);
    }

    console.log(`\nMigrated ${all.length} articles to ${outputDir}`);
}

main();
