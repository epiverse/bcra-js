import { describe, it, expect } from 'vitest';
import { VERSION } from '../../src/index.js';

describe('Basic setup', () => {
  it('should have a version number', () => {
    expect(VERSION).toBe('1.0.0');
  });

  it('should export VERSION', () => {
    expect(VERSION).toBeDefined();
    expect(typeof VERSION).toBe('string');
  });
});
