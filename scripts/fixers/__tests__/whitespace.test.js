/**
 * Unit tests for whitespace fixer
 */

import { describe, it, expect } from 'vitest';
import { fixWhitespace } from '../whitespace.js';

describe('Whitespace Fixer', () => {
  it('removes trailing whitespace', () => {
    const input = 'local x = 1   \n';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\n');
    expect(result.fixed).toBe(1);
  });

  it('removes trailing whitespace from multiple lines', () => {
    const input = 'local x = 1   \nlocal y = 2  \nlocal z = 3\n';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\nlocal y = 2\nlocal z = 3\n');
    expect(result.fixed).toBe(2);
  });

  it('handles whitespace-only lines', () => {
    const input = 'local x = 1\n   \nlocal y = 2\n';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\n\nlocal y = 2\n');
    expect(result.fixed).toBe(1);
  });

  it('adds newline at end of file if missing', () => {
    const input = 'local x = 1  ';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\n');
    expect(result.fixed).toBe(1);
  });

  it('preserves content when no fixes needed', () => {
    const input = 'local x = 1\nlocal y = 2\n';
    const result = fixWhitespace(input);
    expect(result.content).toBe(input);
    expect(result.fixed).toBe(0);
  });

  it('handles tabs as trailing whitespace', () => {
    const input = 'local x = 1\t\t\n';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\n');
    expect(result.fixed).toBe(1);
  });

  it('handles mixed spaces and tabs', () => {
    const input = 'local x = 1 \t \n';
    const result = fixWhitespace(input);
    expect(result.content).toBe('local x = 1\n');
    expect(result.fixed).toBe(1);
  });
});

