#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['public', 'dist'];
const offenders = [];

function isResearchPath(name) {
    const lower = name.toLowerCase();
    return lower === 'research' || lower.startsWith('research.');
}

function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (isResearchPath(entry.name)) {
            offenders.push(relative(process.cwd(), path));
        } else if (entry.isDirectory()) {
            scan(path);
        }
    }
}

for (const root of roots) {
    try {
        scan(root);
    } catch (error) {
        if (error.code === 'ENOENT') {
            if (root === 'dist') {
                console.error('dist/ not found — run npm run build before npm run lint:research.');
                process.exit(1);
            }
            continue;
        }
        throw error;
    }
}

if (offenders.length > 0) {
    console.error('Research material found in published paths:');
    for (const path of offenders) {
        console.error(`  - ${path}`);
    }
    console.error('Move it to research/ at the repo root.');
    process.exit(1);
}

console.log('OK: no research material in public/ or dist/.');
