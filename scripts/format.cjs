#!/usr/bin/env node

/**
 * PartyMacroManager Format Script
 * Formats Lua code using StyLua (standard Lua formatter)
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Formatter          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  try {
    log.info('Formatting Lua files with StyLua...');
    execSync(`npx stylua "${SRC_DIR}"`, { 
      stdio: 'inherit',
      cwd: PROJECT_ROOT 
    });
    console.log();
    log.success('All files formatted successfully!');
  } catch (error) {
    console.log();
    log.error('Formatting failed!');
    process.exit(1);
  }
}

main();
