#!/usr/bin/env node

/**
 * PartyMacroManager Lint Script
 * Uses node-luacheck bindings to lint Lua code without requiring system luacheck
 */

const luacheck = require('luacheck');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const LUACHECK_RC = path.join(PROJECT_ROOT, '.luacheckrc');

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

function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Lua Linter         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  const luaFiles = findLuaFiles(SRC_DIR);
  
  if (luaFiles.length === 0) {
    log.warn('No Lua files found in src/');
    return;
  }

  log.info(`Checking ${luaFiles.length} file(s)...`);
  console.log();

  let totalIssues = 0;
  let filesWithIssues = 0;
  let luacheckAvailable = true;

  // Build options for luacheck
  const options = {};
  if (fs.existsSync(LUACHECK_RC)) {
    options.config = LUACHECK_RC;
  }

  for (const filePath of luaFiles) {
    const relPath = path.relative(PROJECT_ROOT, filePath);
    
    try {
      const errors = luacheck(filePath, options);
      
      if (errors && errors.length > 0) {
        filesWithIssues++;
        totalIssues += errors.length;
        
        console.log(`${colors.yellow}${relPath}${colors.reset}`);
        
        for (const error of errors) {
          const type = error.code && error.code.startsWith('E') ? colors.red : colors.yellow;
          const line = error.line || 'unknown';
          const col = error.column || 'unknown';
          const code = error.code || 'unknown';
          const msg = error.msg || error.message || 'unknown issue';
          console.log(`  ${type}${line}:${col}${colors.reset} ${code} ${msg}`);
        }
        
        console.log();
      }
    } catch (error) {
      if (error.message.includes('ENOENT') || error.message.includes('spawn')) {
        if (luacheckAvailable) {
          luacheckAvailable = false;
          console.log();
          log.warn('luacheck binary not found on your system');
          console.log();
          log.info('The npm package "luacheck" requires the luacheck binary to be installed');
          console.log();
          console.log('To install luacheck:');
          console.log();
          console.log('  macOS:');
          console.log(`    ${colors.cyan}brew install luacheck${colors.reset}`);
          console.log();
          console.log('  Ubuntu/Debian:');
          console.log(`    ${colors.cyan}sudo apt-get install lua-check${colors.reset}`);
          console.log();
          console.log('  Arch Linux:');
          console.log(`    ${colors.cyan}sudo pacman -S luacheck${colors.reset}`);
          console.log();
          console.log('  Via LuaRocks (any platform):');
          console.log(`    ${colors.cyan}luarocks install luacheck${colors.reset}`);
          console.log();
          log.info('Linting is optional - your addon will work without it!');
        }
        process.exit(0);
      }
      log.error(`Failed to check ${relPath}: ${error.message}`);
      filesWithIssues++;
    }
  }

  console.log(`${colors.dim}${'─'.repeat(40)}${colors.reset}`);
  console.log();

  if (totalIssues === 0 && luacheckAvailable) {
    log.success(`All ${luaFiles.length} file(s) passed!`);
    process.exit(0);
  } else if (!luacheckAvailable) {
    process.exit(0);
  } else {
    log.error(`Found ${totalIssues} issue(s) in ${filesWithIssues} file(s)`);
    process.exit(1);
  }
}

main();
