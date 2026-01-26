#!/usr/bin/env node

/**
 * PartyMacroManager Build Script
 * Transpiles TypeScript to Lua and creates a distributable zip file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`)
};

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

function run(command, description) {
  log.step(description);
  try {
    execSync(command, { cwd: PROJECT_ROOT, stdio: 'inherit' });
  } catch (error) {
    log.error(`Failed: ${description}`);
    process.exit(1);
  }
}

async function build() {
  console.log('\n📦 Building PartyMacroManager\n');

  // Clean dist directory
  log.step('Cleaning dist directory');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  log.success('Cleaned dist directory');

  // Transpile TypeScript to Lua
  run('npx tstl', 'Transpiling TypeScript to Lua');
  log.success('Transpiled TypeScript to Lua');

  // Generate .toc file
  run('node scripts/generate-toc.mjs', 'Generating .toc file');
  log.success('Generated .toc file');

  // Create zip file
  run('node scripts/create-zip.mjs', 'Creating distribution zip');
  log.success('Created distribution zip');

  console.log('\n✅ Build complete!\n');
}

build().catch((error) => {
  log.error(error.message);
  process.exit(1);
});
