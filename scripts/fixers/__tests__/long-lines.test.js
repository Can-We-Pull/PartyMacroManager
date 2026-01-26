/**
 * Unit tests for long lines fixer
 */

import { describe, it, expect } from 'vitest';
import {
  fixLongLines,
  breakStringAssignment,
  breakConcatenatedString,
  breakFunctionCall
} from '../long-lines.js';

describe('Long Lines Fixer', () => {
  describe('breakStringAssignment', () => {
    it('breaks long string assignment', () => {
      const line = 'local text = "This is a very long string that exceeds the maximum line length and needs to be broken up into multiple lines"';
      const result = breakStringAssignment(line, 120);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result[0].length).toBeLessThanOrEqual(120);
      expect(result[1]).toContain('.. "');
    });

    it('breaks string assignment with suffix', () => {
      const line = 'local text = "This is a very long string that exceeds the maximum line length and needs to be broken up" or "default"';
      const result = breakStringAssignment(line, 120);
      expect(result).not.toBeNull();
      expect(result[1]).toContain('or "default"');
    });

    it('breaks string with colon syntax', () => {
      const line = '    text = "This is a very long string that exceeds the maximum line length and needs to be broken up into multiple lines"';
      const result = breakStringAssignment(line, 120);
      expect(result).not.toBeNull();
      expect(result[0]).toMatch(/^\s{4}/);
    });

    it('returns null for short lines', () => {
      const line = 'local text = "Short"';
      const result = breakStringAssignment(line, 120);
      expect(result).toBeNull();
    });
  });

  describe('breakConcatenatedString', () => {
    it('breaks long concatenated string', () => {
      const line = '    .. "This is a very long string that is already concatenated but still exceeds the maximum line length allowed by our coding standards"';
      const result = breakConcatenatedString(line, 120);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result[0]).toContain('.. "');
      expect(result[1]).toContain('.. "');
    });

    it('preserves indentation in concatenated strings', () => {
      const line = '        .. "This is a very long string that is already concatenated but still exceeds the maximum line length allowed by our rules"';
      const result = breakConcatenatedString(line, 120);
      expect(result).not.toBeNull();
      expect(result[0]).toMatch(/^\s{8}/);
      expect(result[1]).toMatch(/^\s{8}/);
    });

    it('returns null for short concatenated strings', () => {
      const line = '    .. "Short"';
      const result = breakConcatenatedString(line, 120);
      expect(result).toBeNull();
    });
  });

  describe('breakFunctionCall', () => {
    it('breaks long AddLine call', () => {
      const line = '    GameTooltip:AddLine("This is a very long tooltip text that exceeds the maximum line length and should be broken up", nil, nil, nil, true)';
      const result = breakFunctionCall(line, 120);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);
      expect(result[0]).toContain('AddLine(');
      expect(result[3]).toContain(')');
    });

    it('breaks long print call', () => {
      const line = '    print("This is a very long message that exceeds the maximum line length and needs to be broken up into multiple lines")';
      const result = breakFunctionCall(line, 120);
      expect(result).not.toBeNull();
      expect(result[0]).toContain('print(');
    });

    it('returns null for non-target functions', () => {
      const line = '    someFunction("This is a very long string that exceeds the maximum line length")';
      const result = breakFunctionCall(line, 120);
      expect(result).toBeNull();
    });

    it('returns null for short function calls', () => {
      const line = '    print("Short")';
      const result = breakFunctionCall(line, 120);
      expect(result).toBeNull();
    });
  });

  describe('fixLongLines integration', () => {
    it('fixes multiple long lines', () => {
      const input = `${[
        'local text = "This is a very long string that exceeds the maximum line length and needs to be broken up into multiple lines"',
        'local short = "ok"',
        '    .. "Another very long string that is already concatenated but still exceeds the maximum line length allowed in our rules"'
      ].join('\n')  }\n`;
      
      const result = fixLongLines(input, 120);
      expect(result.fixed).toBe(2);
      const lines = result.content.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        expect(lines[i].length).toBeLessThanOrEqual(120);
      }
    });

    it('preserves content when no fixes needed', () => {
      const input = 'local x = 1\nlocal y = 2\n';
      const result = fixLongLines(input, 120);
      expect(result.content).toBe(input);
      expect(result.fixed).toBe(0);
    });

    it('handles edge case with no good break point', () => {
      const input = 'local text = "VeryLongWordWithNoSpacesOrPunctuationThatCannotBeBrokenUpEasilyAndWillExceedTheMaximumLineLengthWithoutAnyGoodBreakPoints"\n';
      const result = fixLongLines(input, 120);
      // Should not break if no good break point found
      expect(result.fixed).toBe(0);
    });
  });
});
