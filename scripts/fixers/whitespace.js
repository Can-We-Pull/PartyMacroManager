/**
 * Whitespace fixer module
 * Fixes trailing whitespace and ensures files end with newline
 */

/**
 * Fix whitespace issues in content
 * @param {string} content - File content
 * @returns {Object} - { content: string, fixed: number }
 */
function fixWhitespace(content) {
  const lines = content.split('\n');
  let fixed = 0;

  const fixedLines = lines.map((line) => {
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
    
    return { content: fixedContent, fixed };
  }

  return { content, fixed: 0 };
}

export { fixWhitespace };
