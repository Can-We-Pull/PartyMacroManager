#!/usr/bin/env node

/**
 * PartyMacroManager Build Script
 * Creates a distributable zip file for the WoW addon
 * Similar to a TypeScript production build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BUILD_DIR = path.join(PROJECT_ROOT, 'PartyMacroManager');
const TOC_FILE = path.join(SRC_DIR, 'PartyMacroManager.toc');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

// Get version from command line or package.json
function getVersion() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    return args[0];
  }

  // Read from package.json
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    return pkg.version;
  } catch (error) {
    log.error('Could not read version from package.json');
    process.exit(1);
  }
}

// Update version in .toc file
function updateTocVersion(version) {
  try {
    let tocContent = fs.readFileSync(TOC_FILE, 'utf8');
    tocContent = tocContent.replace(/^## Version: .*/m, `## Version: v${version}`);
    fs.writeFileSync(TOC_FILE, tocContent);
    log.success(`Updated PartyMacroManager.toc to version v${version}`);
  } catch (error) {
    log.error(`Failed to update .toc file: ${error.message}`);
    process.exit(1);
  }
}

// Update version in package.json file
function updatePackageVersion(version) {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    pkg.version = version;
    fs.writeFileSync(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)  }\n`);
    log.success(`Updated package.json to version ${version}`);
  } catch (error) {
    log.error(`Failed to update package.json: ${error.message}`);
    process.exit(1);
  }
}

// Clean build artifacts
function cleanBuildDir() {
  log.step('Cleaning build artifacts...');
  
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  
  // Clean up any old zip files
  const files = fs.readdirSync(PROJECT_ROOT);
  files.forEach(file => {
    if (file.startsWith('PartyMacroManager-') && file.endsWith('.zip')) {
      fs.unlinkSync(path.join(PROJECT_ROOT, file));
    }
  });
  
  log.success('Cleaned build directory');
}

// Copy source files to build directory
function copySourceFiles() {
  log.step('Copying source files...');
  
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(SRC_DIR, BUILD_DIR);
  log.success('Copied source files');
}

// Create zip file
function createZip(version) {
  log.step('Creating zip archive...');
  
  const zipName = `PartyMacroManager-${version}.zip`;
  const outputZip = path.join(PROJECT_ROOT, zipName);
  
  try {
    // Use zip command if available, otherwise use a Node.js alternative
    const cwd = PROJECT_ROOT;
    execSync(`zip -r "${zipName}" PartyMacroManager/`, { cwd, stdio: 'pipe' });
    log.success(`Created ${zipName}`);
    return outputZip;
  } catch (error) {
    log.error(`Failed to create zip: ${error.message}`);
    log.warn('Make sure "zip" command is installed, or install archiver package for pure Node.js solution');
    process.exit(1);
  }
}

// Main build function
function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  PartyMacroManager Build              ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
  console.log();

  const version = getVersion();
  log.info(`Building version: ${version}`);
  console.log();

  try {
    updatePackageVersion(version);
    updateTocVersion(version);
    cleanBuildDir();
    copySourceFiles();
    const outputZip = createZip(version);
    
    // Clean up build directory after zipping
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    
    console.log();
    log.success(`Build complete! PartyMacroManager-${version}.zip created`);
    log.info(`Location: ${outputZip}`);
  } catch (error) {
    log.error(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
