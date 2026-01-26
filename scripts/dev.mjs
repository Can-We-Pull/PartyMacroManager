#!/usr/bin/env node

/**
 * PartyMacroManager Development Watch Script
 * Watches TypeScript files and transpiles on changes, syncing to WoW addon directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if it exists
config({ path: path.resolve(__dirname, '..', '.env.local') });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
  watch: (msg) => console.log(`${colors.magenta}👁 ${msg}${colors.reset}`)
};

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const DIST_DEV_DIR = path.join(DIST_DIR, 'dev');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

// Read package.json
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const addonName = 'PartyMacroManager';

// Detect WoW addon directory
function getWowAddonPath() {
  // Check for .env.local configuration first
  if (process.env.WOW_RETAIL_PATH) {
    const customPath = path.join(process.env.WOW_RETAIL_PATH, 'Interface', 'AddOns', addonName);
    if (fs.existsSync(path.dirname(customPath))) {
      log.info('Using WoW path from .env.local');
      return customPath;
    } else {
      log.warn(`WOW_RETAIL_PATH set but directory not found: ${process.env.WOW_RETAIL_PATH}`);
      log.warn('Falling back to auto-detection...');
    }
  }
  
  // Auto-detection fallback
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  
  const possiblePaths = [
    // Linux
    path.join(homeDir, '.wine/drive_c/Program Files (x86)/World of Warcraft/_retail_/Interface/AddOns'),
    path.join(homeDir, '.var/app/com.usebottles.bottles/data/bottles/bottles/World-of-Warcraft/drive_c/Program Files (x86)/World of Warcraft/_retail_/Interface/AddOns'),
    // macOS
    path.join(homeDir, 'Applications/World of Warcraft/_retail_/Interface/AddOns'),
    // Windows
    path.join('C:', 'Program Files (x86)', 'World of Warcraft', '_retail_', 'Interface', 'AddOns')
  ];

  for (const wowPath of possiblePaths) {
    if (fs.existsSync(wowPath)) {
      return path.join(wowPath, addonName);
    }
  }

  return null;
}

// Generate .toc file
function generateTocFile(targetDir) {
  const addon = pkg.addon || {};
  const tocLines = [
    `## Interface: ${addon.interface ? addon.interface.join(', ') : '120000'}`,
    `## Title: ${addon.title || pkg.description}`,
    `## Notes: ${addon.notes || pkg.description}`,
    `## Author: ${addon.author || pkg.author}`,
    `## Version: ${pkg.version}`,
    `## SavedVariables: ${addon.savedVariables ? addon.savedVariables.join(', ') : ''}`
  ];

  // Add optional dependencies (e.g., WoWUnit for testing)
  const optionalDeps = addon.optionalDeps ? addon.optionalDeps.join(', ') : '';
  if (optionalDeps) {
    tocLines.push(`## OptionalDeps: ${optionalDeps}`);
  }

  tocLines.push('');

  if (addon.loadOrder && Array.isArray(addon.loadOrder)) {
    tocLines.push(...addon.loadOrder);
  }

  // Note: Test files are copied separately and run via WoWUnit, not included in .toc
  // The WoWUnit addon handles loading test files independently

  const tocContent = tocLines.join('\n');
  const tocPath = path.join(targetDir, `${addonName}.toc`);
  fs.writeFileSync(tocPath, tocContent);
}

// Copy file
function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Generate .toc file to dist/dev folder
function generateDevTocFile() {
  const devDir = path.join(DIST_DIR, 'dev');
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
  }
  generateTocFile(devDir);
}

// Copy test files to dist/dev folder
function copyTestsToDev() {
  const testsDir = path.join(PROJECT_ROOT, 'tests');
  const devDir = path.join(DIST_DIR, 'dev');
  
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
  }

  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir);
    testFiles.forEach(file => {
      if (file.endsWith('.lua')) {
        const srcPath = path.join(testsDir, file);
        const destPath = path.join(devDir, file);
        copyFile(srcPath, destPath);
      }
    });
  }
}

// Sync files to WoW addon directory
function syncToWoW() {
  const wowPath = getWowAddonPath();
  
  if (!wowPath) {
    log.warn('WoW addon directory not found. Skipping sync.');
    return;
  }

  log.step(`Syncing to ${wowPath}`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(wowPath)) {
    fs.mkdirSync(wowPath, { recursive: true });
  }

  // Copy transpiled Lua files from dist/dev (where TSTL bundles output)
  if (fs.existsSync(DIST_DEV_DIR)) {
    const files = fs.readdirSync(DIST_DEV_DIR);
    files.forEach(file => {
      if (file.endsWith('.lua')) {
        const srcPath = path.join(DIST_DEV_DIR, file);
        const destPath = path.join(wowPath, file);
        copyFile(srcPath, destPath);
      }
    });
  }

  // Copy remaining Lua files from src (if any)
  if (fs.existsSync(SRC_DIR)) {
    const files = fs.readdirSync(SRC_DIR);
    files.forEach(file => {
      if (file.endsWith('.lua')) {
        const srcPath = path.join(SRC_DIR, file);
        const destPath = path.join(wowPath, file);
        copyFile(srcPath, destPath);
      }
    });
  }

  // Copy test files for development
  const testsDir = path.join(PROJECT_ROOT, 'tests');
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir);
    testFiles.forEach(file => {
      if (file.endsWith('.lua')) {
        const srcPath = path.join(testsDir, file);
        const destPath = path.join(wowPath, file);
        copyFile(srcPath, destPath);
        log.info(`Copied test file: ${file}`);
      }
    });
  }

  // Generate and copy .toc file
  generateTocFile(wowPath);

  log.success('Synced to WoW addon directory');
}

// Run TypeScript-to-Lua in watch mode
function watchTypeScript() {
  log.watch('Starting TypeScript-to-Lua watch mode...');
  
  const tstl = spawn('npx', ['tstl', '--watch'], {
    cwd: PROJECT_ROOT,
    stdio: 'pipe'
  });

  tstl.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // Sync to WoW after successful compilation
    if (output.includes('Compilation complete') || output.includes('Found 0 errors')) {
      setTimeout(() => {
        syncToWoW();
      }, 100);
    }
  });

  tstl.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  tstl.on('close', (code) => {
    if (code !== 0) {
      log.error(`TypeScript-to-Lua watch exited with code ${code}`);
      process.exit(code);
    }
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log.info('Stopping watch mode...');
    tstl.kill();
    process.exit(0);
  });
}

// Main function
async function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Dev Watch          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  const wowPath = getWowAddonPath();
  if (wowPath) {
    log.info(`WoW addon directory: ${wowPath}`);
  } else {
    log.warn('WoW addon directory not found. Files will only be built to dist/');
  }
  console.log();

  // Initial sync
  log.step('Performing initial build...');
  
  // Copy test files to dist/dev and generate .toc with tests
  copyTestsToDev();
  generateDevTocFile();
  
  syncToWoW();
  console.log();

  // Start watching
  watchTypeScript();
}

// Run the script
main();
