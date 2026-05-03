import config from '../config.json';

describe('config.json', () => {
  test('has RSS config', () => {
    expect(config.rss).toBeDefined();
    expect(config.rss.url).toContain('bbc');
  });

  test('has announcements', () => {
    expect(Array.isArray(config.announcements.items)).toBe(true);
  });

  test('has images array', () => {
    expect(Array.isArray(config.images.items)).toBe(true);
  });
});