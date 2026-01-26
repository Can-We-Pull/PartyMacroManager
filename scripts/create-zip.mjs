#!/usr/bin/env node

/**
 * Create distribution zip file for WoW addon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const DIST_DEV_DIR = path.join(DIST_DIR, 'dev');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const addonName = 'PartyMacroManager';

async function createZip(version) {
  if (!fs.existsSync(DIST_DEV_DIR) || fs.readdirSync(DIST_DEV_DIR).length === 0) {
    console.error('✗ dist/dev is empty. Run transpile first.');
    process.exit(1);
  }

  const zipName = `${addonName}-${version}.zip`;
  const zipPath = path.join(DIST_DIR, zipName);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✓ Created ${zipName} (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(DIST_DEV_DIR, addonName);
    archive.finalize();
  });
}

const version = process.argv[2] || pkg.version;
createZip(version).catch((error) => {
  console.error(`✗ Failed to create zip: ${error.message}`);
  process.exit(1);
});
