#!/usr/bin/env node

/**
 * Generate .toc file for WoW addon from package.json metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DEV_DIR = path.join(PROJECT_ROOT, 'dist', 'dev');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const addonName = 'PartyMacroManager';

function generateTocContent(version) {
  const addon = pkg.addon || {};
  
  const tocLines = [
    `## Interface: ${addon.interface?.join(', ') || '120000'}`,
    `## Title: ${addon.title || pkg.description}`,
    `## Notes: ${addon.notes || pkg.description}`,
    `## Author: ${addon.author || pkg.author}`,
    `## Version: ${version}`,
    `## SavedVariables: ${addon.savedVariables?.join(', ') || ''}`
  ];

  if (addon.optionalDeps?.length > 0) {
    tocLines.push(`## OptionalDeps: ${addon.optionalDeps.join(', ')}`);
  }

  tocLines.push('', ...(addon.loadOrder || []));

  return tocLines.join('\n');
}

function writeTocFile(version) {
  fs.mkdirSync(DIST_DEV_DIR, { recursive: true });
  
  const tocContent = generateTocContent(version);
  const tocPath = path.join(DIST_DEV_DIR, `${addonName}.toc`);
  
  fs.writeFileSync(tocPath, tocContent);
  console.log(`✓ Generated ${addonName}.toc (version ${version})`);
}

const version = process.argv[2] || pkg.version;

// Only run when executed directly (not when imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeTocFile(version);
}

export { generateTocContent, writeTocFile };
