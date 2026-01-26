#!/usr/bin/env node

/**
 * PartyMacroManager Lint Autofix Script
 * Automatically fixes common lint issues like trailing whitespace and long lines
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyAllFixes } from './fixers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Recursively find all .lua files
function findLuaFiles(dir) {
  let luaFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      luaFiles = luaFiles.concat(findLuaFiles(fullPath));
    } else if (entry.name.endsWith('.lua')) {
      luaFiles.push(fullPath);
    }
  }

  return luaFiles;
}

// Fix all issues in a file
function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const result = applyAllFixes(content);
  
  if (result.whitespaceFixed > 0 || result.longLinesFixed > 0) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    return {
      whitespaceFixed: result.whitespaceFixed,
      longLinesFixed: result.longLinesFixed
    };
  }
  
  return {
    whitespaceFixed: 0,
    longLinesFixed: 0
  };
}

function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Lint Autofix       ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  const luaFiles = findLuaFiles(SRC_DIR);
  
  if (luaFiles.length === 0) {
    log.warn('No Lua files found in src/');
    return;
  }

  log.info(`Checking ${luaFiles.length} file(s)...`);
  console.log();

  let totalFixed = 0;
  let filesFixed = 0;

  for (const filePath of luaFiles) {
    const relPath = path.relative(PROJECT_ROOT, filePath);
    const result = fixFile(filePath);
    const totalFileFixed = result.whitespaceFixed + result.longLinesFixed;
    
    if (totalFileFixed > 0) {
      filesFixed++;
      totalFixed += totalFileFixed;
      const details = [];
      if (result.whitespaceFixed > 0) {details.push(`${result.whitespaceFixed} whitespace`);}
      if (result.longLinesFixed > 0) {details.push(`${result.longLinesFixed} long lines`);}
      log.success(`Fixed ${details.join(', ')} in ${relPath}`);
    }
  }

  console.log();
  console.log(`${colors.cyan}${'─'.repeat(40)}${colors.reset}`);
  console.log();

  if (totalFixed === 0) {
    log.success('No issues found - all files are clean!');
  } else {
    log.success(`Fixed ${totalFixed} issue(s) in ${filesFixed} file(s)`);
    log.info('Run "npm run lint" to verify fixes');
  }
}

main();
