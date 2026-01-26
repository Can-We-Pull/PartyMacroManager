/**
 * Long lines fixer module
 * Breaks lines that exceed maximum length
 */

/**
 * Break a long string assignment
 * @param {string} line - The line to fix
 * @param {number} maxLength - Maximum line length
 * @returns {Array<string>|null} - Fixed lines or null if couldn't fix
 */
function breakStringAssignment(line, maxLength) {
  const match = line.match(/^(\s*)(.+?[=:]\s*)"(.+)"(.*)$/);
  if (!match) {return null;}

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
    
    return [
      `${lineIndent}${prefix}"${part1}"`,
      `${lineIndent}    .. "${part2}"${suffix}`
    ];
  }
  
  return null;
}

/**
 * Break a long concatenated string
 * @param {string} line - The line to fix
 * @param {number} maxLength - Maximum line length
 * @returns {Array<string>|null} - Fixed lines or null if couldn't fix
 */
function breakConcatenatedString(line, maxLength) {
  const match = line.match(/^(\s*)\.\.?\s*"(.+)"(.*)$/);
  if (!match) {return null;}

  const [, lineIndent, stringContent, suffix] = match;
  
  // Calculate target length for first part
  const firstLineTarget = maxLength - (lineIndent.length + 7); // 7 for '.. ""'
  
  if (stringContent.length <= firstLineTarget) {return null;}

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
    
    return [
      `${lineIndent}.. "${part1}"`,
      `${lineIndent}.. "${part2}"${suffix}`
    ];
  }
  
  return null;
}

/**
 * Break a function call with long string arguments
 * @param {string} line - The line to fix
 * @param {number} maxLength - Maximum line length
 * @returns {Array<string>|null} - Fixed lines or null if couldn't fix
 */
function breakFunctionCall(line, maxLength) {
  if (!line.includes('AddLine(') && !line.includes('SetText(') && !line.includes('print(')) {
    return null;
  }

  const match = line.match(/^(\s*)(.+?\()(.+)(\).*)$/);
  if (!match) {return null;}

  const [, lineIndent, funcStart, args, funcEnd] = match;
  
  // Check if it's a long string argument
  if (!args.match(/^"[^"]{50,}"/)) {return null;}

  const stringMatch = args.match(/^"([^"]+)"(.*)$/);
  if (!stringMatch) {return null;}

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
    
    return [
      `${lineIndent}${funcStart}`,
      `${lineIndent}    "${part1} "`,
      `${lineIndent}    .. "${part2}"${restArgs}`,
      `${lineIndent}${funcEnd}`
    ];
  }
  
  return null;
}

/**
 * Fix long lines in content
 * @param {string} content - File content
 * @param {number} maxLength - Maximum line length (default 120)
 * @returns {Object} - { content: string, fixed: number }
 */
function fixLongLines(content, maxLength = 120) {
  const lines = content.split('\n');
  let fixed = 0;
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.length <= maxLength) {
      fixedLines.push(line);
      continue;
    }

    // Try different fixing strategies
    let result = null;
    
    // Try to break long strings
    if (line.includes('"') && line.match(/[=:]\s*"/)) {
      result = breakStringAssignment(line, maxLength);
    }
    
    // Try to break concatenated strings
    if (!result && line.includes('.. "') && line.includes('"')) {
      result = breakConcatenatedString(line, maxLength);
    }
    
    // Try to break function calls
    if (!result) {
      result = breakFunctionCall(line, maxLength);
    }
    
    if (result) {
      fixedLines.push(...result);
      fixed++;
    } else {
      // If we couldn't fix it intelligently, just keep the line
      fixedLines.push(line);
    }
  }

  if (fixed > 0) {
    let fixedContent = fixedLines.join('\n');
    if (content.endsWith('\n') && !fixedContent.endsWith('\n')) {
      fixedContent += '\n';
    }
    
    return { content: fixedContent, fixed };
  }

  return { content, fixed: 0 };
}

export {
  fixLongLines,
  breakStringAssignment,
  breakConcatenatedString,
  breakFunctionCall
};
