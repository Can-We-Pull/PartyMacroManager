/**
 * Unit tests for fixer integration
 */

import { describe, it, expect } from 'vitest';
import { applyAllFixes } from '../index.js';

describe('Fixer Integration', () => {
  it('applies all fixes together', () => {
    const input = [
      'local text = "This is a very long string that exceeds the maximum line length and needs to be broken up into multiple lines"  ',
      'local short = "ok"  ',
      ''
    ].join('\n');
    
    const result = applyAllFixes(input);
    expect(result.whitespaceFixed).toBe(2);
    expect(result.longLinesFixed).toBe(1);
    expect(result.content).toMatch(/\n$/);
    
    const lines = result.content.split('\n');
    for (const line of lines) {
      expect(line).not.toMatch(/\s+$/);
      if (line.length > 0) {
        expect(line.length).toBeLessThanOrEqual(120);
      }
    }
  });

  it('handles content with no issues', () => {
    const input = 'local x = 1\nlocal y = 2\n';
    const result = applyAllFixes(input);
    expect(result.content).toBe(input);
    expect(result.whitespaceFixed).toBe(0);
    expect(result.longLinesFixed).toBe(0);
  });

  it('fixes whitespace after fixing long lines', () => {
    const input = 'local text = "This is a very long string that exceeds the maximum line length and needs to be broken up into multiple lines"  \n';
    const result = applyAllFixes(input);
    
    // Should fix both the long line and any trailing whitespace
    const lines = result.content.split('\n');
    for (const line of lines) {
      expect(line).not.toMatch(/\s+$/);
    }
  });

  it('preserves indentation', () => {
    const input = '    local text = "This is a very long string that exceeds the maximum line length and needs to be broken"  \n';
    const result = applyAllFixes(input);
    
    const lines = result.content.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      if (line.trim().length > 0) {
        expect(line).toMatch(/^\s{4}/);
      }
    }
  });
});
