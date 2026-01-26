#!/usr/bin/env node

/**
 * Test runner for lint-fix tests
 */

const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  Lint Fixer Unit Tests                ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);

const testFiles = [
  'whitespace.test.js',
  'long-lines.test.js',
  'integration.test.js'
];

let allPassed = true;

for (const testFile of testFiles) {
  const testPath = path.join(__dirname, 'fixers', '__tests__', testFile);
  try {
    execSync(`node "${testPath}"`, { stdio: 'inherit' });
  } catch (_error) {
    allPassed = false;
  }
}

console.log(`\n${  '═'.repeat(40)}`);

if (allPassed) {
  console.log(`${colors.green}All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}Some tests failed${colors.reset}\n`);
  process.exit(1);
}
