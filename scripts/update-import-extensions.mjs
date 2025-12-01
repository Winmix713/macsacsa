#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const rootDir = new URL('..', import.meta.url).pathname;
const sourceDir = join(rootDir, 'src');

const replacements = [
  { search: 'matchHistory.tsx', replace: 'matchHistory.ts' },
  { search: 'teamOptions.tsx', replace: 'teamOptions.ts' },
  { search: 'usePhaseFlags.tsx', replace: 'usePhaseFlags.ts' },
];

const allowedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.mdx']);
const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build']);

let updatedFileCount = 0;

const shouldProcessFile = (filePath) => {
  const extension = extname(filePath);
  return allowedExts.has(extension);
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          await walk(fullPath);
        }
        return;
      }

      if (!entry.isFile() || !shouldProcessFile(fullPath)) {
        return;
      }

      const original = await readFile(fullPath, 'utf8');

      if (!replacements.some(({ search }) => original.includes(search))) {
        return;
      }

      let updated = original;
      for (const { search, replace } of replacements) {
        if (updated.includes(search)) {
          updated = updated.replaceAll(search, replace);
        }
      }

      if (updated !== original) {
        await writeFile(fullPath, updated, 'utf8');
        updatedFileCount += 1;
        console.log(`Updated ${relative(rootDir, fullPath)}`);
      }
    }),
  );
};

await walk(sourceDir);

if (updatedFileCount === 0) {
  console.log('No import paths required updating.');
} else {
  console.log(`✅ Updated ${updatedFileCount} file${updatedFileCount === 1 ? '' : 's'} with new extensions.`);
}
