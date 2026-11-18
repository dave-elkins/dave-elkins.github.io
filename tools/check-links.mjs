#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');

function walk(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...walk(full));
        else results.push(full);
    }
    return results;
}

function exists(target) {
    if (fs.existsSync(target)) return true;
    if (fs.existsSync(`${target}/index.html`)) return true;
    return false;
}

function main() {
    if (!fs.existsSync(distDir)) throw new Error('dist/ not found. Run `npm run build` first.');

    const htmlFiles = walk(distDir).filter((file) => file.endsWith('.html'));
    const broken = [];
    const checked = new Set();

    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf8');
        for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
            const raw = match[1];
            if (
                !raw.startsWith('/') ||
                raw.startsWith('//') ||
                raw.startsWith('mailto:') ||
                raw.startsWith('tel:') ||
                raw.startsWith('data:')
            ) {
                continue;
            }

            const clean = decodeURIComponent(raw.split('#')[0].split('?')[0]);
            const key = `${path.relative(distDir, file)} -> ${clean}`;
            if (checked.has(key)) continue;
            checked.add(key);

            const target = path.join(distDir, clean === '/' ? '' : clean.replace(/^\//, ''));
            if (!exists(target)) broken.push(key);
        }
    }

    if (broken.length) {
        console.error(`Found ${broken.length} broken internal link(s):`);
        for (const item of broken) console.error(`  ${item}`);
        process.exit(1);
    }

    console.log(
        `Checked ${checked.size} internal link(s) across ${htmlFiles.length} page(s). All OK.`,
    );
}

main();
