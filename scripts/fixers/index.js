/**
 * Fixer modules index
 * Exports all fixer functions
 */

import { fixWhitespace } from './whitespace.js';
import { fixLongLines } from './long-lines.js';

/**
 * Apply all fixes to file content
 * @param {string} content - File content
 * @returns {Object} - { content: string, whitespaceFixed: number, longLinesFixed: number }
 */
function applyAllFixes(content) {
  // Fix whitespace first
  const whitespaceResult = fixWhitespace(content);
  
  // Then fix long lines
  const longLinesResult = fixLongLines(whitespaceResult.content);
  
  return {
    content: longLinesResult.content,
    whitespaceFixed: whitespaceResult.fixed,
    longLinesFixed: longLinesResult.fixed
  };
}

export {
  fixWhitespace,
  fixLongLines,
  applyAllFixes
};
