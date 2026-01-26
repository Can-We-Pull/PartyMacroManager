#!/usr/bin/env node

/**
 * PartyMacroManager Lint Autofix Script
 * Automatically fixes common lint issues like trailing whitespace
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  file: (msg) => console.log(`${colors.cyan}→ ${msg}${colors.reset}`),
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

// Fix whitespace issues in a file
function fixWhitespace(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixed = 0;

  const fixedLines = lines.map((line, index) => {
    const originalLine = line;
    
    // Remove trailing whitespace (including whitespace-only lines)
    line = line.replace(/\s+$/g, '');
    
    if (originalLine !== line) {
      fixed++;
    }
    
    return line;
  });

  if (fixed > 0) {
    // Join with newlines and ensure file ends with newline
    let fixedContent = fixedLines.join('\n');
    if (!fixedContent.endsWith('\n')) {
      fixedContent += '\n';
    }
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    return fixed;
  }

  return 0;
}

// Fix long lines by intelligently breaking them
function fixLongLines(filePath, maxLength = 120) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fixed = 0;
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.length <= maxLength) {
      fixedLines.push(line);
      continue;
    }

    // Get indentation
    const indent = line.match(/^(\s*)/)[0];
    const contentStart = indent.length;
    
    // Try to break long strings
    if (line.includes('"') && line.match(/[=:]\s*"/)) {
      const match = line.match(/^(\s*)(.+?[=:]\s*)"(.+)"(.*)$/);
      if (match) {
        const [, lineIndent, prefix, stringContent, suffix] = match;
        
        // Calculate target length for first part
        const firstLineTarget = maxLength - (lineIndent.length + prefix.length + 2); // 2 for quotes
        
        // Find best break point
        let breakPos = -1;
        const searchStart = Math.max(firstLineTarget - 20, 10);
        const searchEnd = Math.min(firstLineTarget, stringContent.length - 10);
        
        for (let pos = searchEnd; pos >= searchStart; pos--) {
          const char = stringContent[pos];
          if (char === ' ' || char === '.' || char === ',' || char === ';') {
            breakPos = pos + 1;
            break;
          }
        }
        
        if (breakPos > 0 && breakPos < stringContent.length) {
          const part1 = stringContent.substring(0, breakPos).trim();
          const part2 = stringContent.substring(breakPos).trim();
          
          fixedLines.push(`${lineIndent}${prefix}"${part1}"`);
          fixedLines.push(`${lineIndent}    .. "${part2}"${suffix}`);
          fixed++;
          continue;
        }
      }
    }
    
    // Try to break concatenated strings that are already on separate lines
    if (line.includes('.. "') && line.includes('"')) {
      const match = line.match(/^(\s*)\.\.?\s*"(.+)"(.*)$/);
      if (match) {
        const [, lineIndent, stringContent, suffix] = match;
        
        // Calculate target length for first part
        const firstLineTarget = maxLength - (lineIndent.length + 7); // 7 for '.. ""'
        
        if (stringContent.length > firstLineTarget) {
          // Find best break point
          let breakPos = -1;
          const searchStart = Math.max(firstLineTarget - 20, 10);
          const searchEnd = Math.min(firstLineTarget, stringContent.length - 10);
          
          for (let pos = searchEnd; pos >= searchStart; pos--) {
            const char = stringContent[pos];
            if (char === ' ' || char === '.' || char === ',' || char === ';') {
              breakPos = pos + 1;
              break;
            }
          }
          
          if (breakPos > 0 && breakPos < stringContent.length) {
            const part1 = stringContent.substring(0, breakPos).trim();
            const part2 = stringContent.substring(breakPos).trim();
            
            fixedLines.push(`${lineIndent}.. "${part1}"`);
            fixedLines.push(`${lineIndent}.. "${part2}"${suffix}`);
            fixed++;
            continue;
          }
        }
      }
    }
    
    // Try to break function calls with long argument lists
    if (line.includes('AddLine(') || line.includes('SetText(') || line.includes('print(')) {
      const match = line.match(/^(\s*)(.+?\()(.+)(\).*)$/);
      if (match) {
        const [, lineIndent, funcStart, args, funcEnd] = match;
        
        // Check if it's a long string argument
        if (args.match(/^"[^"]{50,}"/)) {
          const stringMatch = args.match(/^"([^"]+)"(.*)$/);
          if (stringMatch) {
            const [, stringContent, restArgs] = stringMatch;
            
            // Calculate target length for first part
            const firstLineTarget = maxLength - (lineIndent.length + funcStart.length + 6);
            
            // Find a good break point in the string
            let breakPos = -1;
            const searchStart = Math.max(firstLineTarget - 20, 10);
            const searchEnd = Math.min(firstLineTarget, stringContent.length - 10);
            
            for (let pos = searchEnd; pos >= searchStart; pos--) {
              const char = stringContent[pos];
              if (char === ' ' || char === '.' || char === ',' || char === ';') {
                breakPos = pos + 1;
                break;
              }
            }
            
            if (breakPos > 0) {
              const part1 = stringContent.substring(0, breakPos).trim();
              const part2 = stringContent.substring(breakPos).trim();
              
              fixedLines.push(`${lineIndent}${funcStart}`);
              fixedLines.push(`${lineIndent}    "${part1} "`);
              fixedLines.push(`${lineIndent}    .. "${part2}"${restArgs}`);
              fixedLines.push(`${lineIndent}${funcEnd}`);
              fixed++;
              continue;
            }
          }
        }
      }
    }
    
    // If we couldn't fix it intelligently, just keep the line
    fixedLines.push(line);
  }

  if (fixed > 0) {
    let fixedContent = fixedLines.join('\n');
    if (content.endsWith('\n') && !fixedContent.endsWith('\n')) {
      fixedContent += '\n';
    }
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    return fixed;
  }

  return 0;
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
    const whitespaceFixed = fixWhitespace(filePath);
    const longLinesFixed = fixLongLines(filePath);
    const totalFileFixed = whitespaceFixed + longLinesFixed;
    
    if (totalFileFixed > 0) {
      filesFixed++;
      totalFixed += totalFileFixed;
      const details = [];
      if (whitespaceFixed > 0) details.push(`${whitespaceFixed} whitespace`);
      if (longLinesFixed > 0) details.push(`${longLinesFixed} long lines`);
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
