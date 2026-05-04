import { formatTime } from '../clock.js';

test('formats time correctly', () => {
  const date = new Date('2026-05-02T17:00:00');
  const result = formatTime(date);

  expect(result).toContain('5:00:00');
});