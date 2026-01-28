// bundlesize.test.js - Test to ensure bundle size doesn't grow unexpectedly
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

const BUNDLE_PATH = join(projectRoot, 'dist', 'dev', 'index.lua');
const BASELINE_PATH = join(projectRoot, '.bundlesize.json');
const THRESHOLD = 0.10; // 10% increase threshold

function getBundleSize() {
  if (!existsSync(BUNDLE_PATH)) {
    throw new Error('Bundle not found. Run "npm run build" first.');
  }
  
  const content = readFileSync(BUNDLE_PATH, 'utf-8');
  return content.length;
}

function getBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    return null;
  }
  
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
  return baseline.size;
}

function updateBaseline(size) {
  const baseline = {
    size,
    timestamp: new Date().toISOString(),
    note: 'Baseline updated. Run tests to verify bundle size stays within threshold.'
  };
  
  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)  }\n`);
  console.log(`✓ Updated baseline to ${size} bytes`);
}

describe('Bundle Size', () => {
  it('should not increase by more than 10% from baseline', () => {
    const currentSize = getBundleSize();
    const baselineSize = getBaseline();
    
    if (baselineSize === null) {
      // No baseline exists, create one
      updateBaseline(currentSize);
      console.log(`ℹ No baseline found. Created baseline: ${currentSize} bytes`);
      return;
    }
    
    const increase = currentSize - baselineSize;
    const percentIncrease = (increase / baselineSize) * 100;
    
    console.log('\nBundle Size Report:');
    console.log(`  Baseline: ${baselineSize.toLocaleString()} bytes`);
    console.log(`  Current:  ${currentSize.toLocaleString()} bytes`);
    console.log(`  Change:   ${increase >= 0 ? '+' : ''}${increase.toLocaleString()} bytes (${percentIncrease.toFixed(2)}%)`);
    
    if (increase > 0 && percentIncrease > THRESHOLD * 100) {
      console.log(`\n❌ Bundle size increased by ${percentIncrease.toFixed(2)}%, exceeding ${(THRESHOLD * 100).toFixed(0)}% threshold.`);
      console.log('\nIf this increase is intentional, update the baseline with:');
      console.log('  npm run test:bundlesize:update\n');
      
      expect(percentIncrease).toBeLessThanOrEqual(THRESHOLD * 100);
    } else if (increase < 0) {
      console.log('\n✓ Bundle size decreased! Consider updating baseline with:');
      console.log('  npm run test:bundlesize:update\n');
    } else {
      console.log('\n✓ Bundle size within acceptable range\n');
    }
  });
});

// Standalone function for updating baseline
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const size = getBundleSize();
    updateBaseline(size);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
