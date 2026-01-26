#!/usr/bin/env node

/**
 * PartyMacroManager Development Watch Script
 * Watches source files for changes and copies them to WoW addon directory
 * Similar to a TypeScript watch mode but for Lua files
 */

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

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
  file: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`)
};

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const CACHE_FILE = path.join(PROJECT_ROOT, '.dev-cache.json');
// Remove escaped spaces and construct full addon path
const WOW_RETAIL_BASE = process.env.WOW_RETAIL_PATH?.replace(/\\ /g, ' ');
const WOW_RETAIL_PATH = WOW_RETAIL_BASE 
  ? path.join(WOW_RETAIL_BASE, 'Interface', 'AddOns', 'PartyMacroManager')
  : null;

// File hash cache for tracking changes
let fileHashes = {};

// Validate environment
function validateEnvironment() {
  if (!WOW_RETAIL_BASE) {
    log.error('WOW_RETAIL_PATH is not set in .env.local');
    log.info('Please copy .env.local.example to .env.local and configure your WoW path');
    process.exit(1);
  }

  if (!fs.existsSync(WOW_RETAIL_PATH)) {
    log.warn(`Destination directory does not exist: ${WOW_RETAIL_PATH}`);
    log.info('Creating directory...');
    fs.mkdirSync(WOW_RETAIL_PATH, { recursive: true });
  }
}

// Load cache from disk
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fileHashes = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    log.warn('Could not load cache, starting fresh');
    fileHashes = {};
  }
}

// Save cache to disk
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(fileHashes, null, 2));
  } catch (error) {
    log.warn('Could not save cache');
  }
}

// Calculate file hash
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

// Copy file if changed (with caching)
function copyIfChanged(srcFile) {
  const relPath = path.relative(SRC_DIR, srcFile);
  const destFile = path.join(WOW_RETAIL_PATH, relPath);
  const currentHash = getFileHash(srcFile);

  if (!currentHash) {return false;}

  const cachedHash = fileHashes[srcFile];
  const destExists = fs.existsSync(destFile);
  const destHash = destExists ? getFileHash(destFile) : null;

  // Copy if:
  // 1. Destination doesn't exist, OR
  // 2. Source hash changed from cache, OR
  // 3. Destination hash doesn't match source (files are out of sync)
  if (!destExists || currentHash !== cachedHash || currentHash !== destHash) {
    try {
      const destDir = path.dirname(destFile);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(srcFile, destFile);
      fileHashes[srcFile] = currentHash;
      saveCache();
      log.success(`Updated: ${relPath}`);
      return true;
    } catch (error) {
      log.error(`Failed to copy ${relPath}: ${error.message}`);
      return false;
    }
  }

  return false;
}

// Delete file from destination
function deleteFromDestination(srcFile) {
  const relPath = path.relative(SRC_DIR, srcFile);
  const destFile = path.join(WOW_RETAIL_PATH, relPath);

  try {
    if (fs.existsSync(destFile)) {
      fs.unlinkSync(destFile);
      delete fileHashes[srcFile];
      saveCache();
      log.success(`Removed: ${relPath}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed to delete ${relPath}: ${error.message}`);
  }

  return false;
}

// Sync all files initially
function syncAllFiles() {
  log.info('Syncing all files...');
  let changed = 0;

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        if (copyIfChanged(filePath)) {
          changed++;
        }
      }
    }
  }

  walkDir(SRC_DIR);

  if (changed === 0) {
    log.success('All files up to date');
  } else {
    log.success(`Synced ${changed} file(s)`);
  }
}

// Main function
function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Dev Watch Mode     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  validateEnvironment();
  loadCache();

  log.info(`Source: ${SRC_DIR}`);
  log.info(`Target: ${WOW_RETAIL_PATH}`);
  console.log();

  syncAllFiles();
  console.log();
  log.info('Watching for changes... (Press Ctrl+C to stop)');
  console.log();

  // Watch for file changes
  const watcher = chokidar.watch(SRC_DIR, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });

  watcher
    .on('add', (filePath) => {
      log.file(`Added: ${path.relative(SRC_DIR, filePath)}`);
      copyIfChanged(filePath);
    })
    .on('change', (filePath) => {
      log.file(`Changed: ${path.relative(SRC_DIR, filePath)}`);
      copyIfChanged(filePath);
    })
    .on('unlink', (filePath) => {
      log.file(`Deleted: ${path.relative(SRC_DIR, filePath)}`);
      deleteFromDestination(filePath);
    })
    .on('error', (error) => {
      log.error(`Watcher error: ${error.message}`);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log();
    log.info('Stopping watch mode...');
    watcher.close();
    saveCache();
    process.exit(0);
  });
}

// Run the script
main();
