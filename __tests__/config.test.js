import config from '../config.json';

describe('config.json', () => {
  test('has RSS config with sources', () => {
    expect(config.rss).toBeDefined();
    expect(Array.isArray(config.rss.sources)).toBe(true);
    expect(config.rss.sources.length).toBeGreaterThan(0);
  });

  test('includes BBC News source', () => {
    const bbc = config.rss.sources.find(
      (source) => source.name === 'BBC News'
    );

    expect(bbc).toBeDefined();
    expect(bbc.url).toContain('bbc');
  });

  test('has announcements', () => {
    expect(Array.isArray(config.announcements.items)).toBe(true);
  });

  test('has comics config', () => {
    expect(config.comics).toBeDefined();
    expect(Array.isArray(config.comics.feeds)).toBe(true);
    expect(config.comics.feeds.length).toBeGreaterThan(0);
  });
});