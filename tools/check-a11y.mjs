#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

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

async function auditFile(file) {
    const html = fs.readFileSync(file, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only' });
    dom.window.HTMLCanvasElement.prototype.getContext = () => null;
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    dom.window.close();
    return results.violations;
}

async function main() {
    if (!fs.existsSync(distDir)) throw new Error('dist/ not found. Run `npm run build` first.');
    const htmlFiles = walk(distDir).filter((file) => file.endsWith('.html'));
    let total = 0;

    for (const file of htmlFiles) {
        const violations = await auditFile(file);
        if (violations.length === 0) continue;
        total += violations.length;
        console.error(`\n${path.relative(distDir, file)}`);
        for (const violation of violations) {
            console.error(`  [${violation.impact ?? 'minor'}] ${violation.id}: ${violation.help}`);
            console.error(`    ${violation.nodes.length} node(s)`);
        }
    }

    if (total > 0) {
        console.error(`\nFound ${total} accessibility violation(s).`);
        process.exit(1);
    }
    console.log(`No WCAG A/AA violations found across ${htmlFiles.length} page(s).`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
