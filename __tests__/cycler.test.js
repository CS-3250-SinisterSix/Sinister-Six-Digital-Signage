import { getNextIndex } from '../cycler.js';

describe('getNextIndex', () => {
  test('increments index normally', () => {
    expect(getNextIndex(0, 3)).toBe(1);
  });

  test('wraps around to 0', () => {
    expect(getNextIndex(2, 3)).toBe(0);
  });

  test('handles single item', () => {
    expect(getNextIndex(0, 1)).toBe(0);
  });

  test('handles empty list', () => {
    expect(getNextIndex(0, 0)).toBe(0);
  });
});