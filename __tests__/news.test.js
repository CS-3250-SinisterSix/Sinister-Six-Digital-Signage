import { parseNewsItems } from '../news.js';

describe('parseNewsItems', () => {
  test('parses RSS titles', () => {
    const xml = `
      <rss><channel>
        <item><title>Headline 1</title></item>
        <item><title>Headline 2</title></item>
      </channel></rss>
    `;

    expect(parseNewsItems(xml, 5)).toEqual(['Headline 1', 'Headline 2']);
  });

  test('limits number of headlines', () => {
    const xml = `
      <rss><channel>
        <item><title>One</title></item>
        <item><title>Two</title></item>
        <item><title>Three</title></item>
      </channel></rss>
    `;

    expect(parseNewsItems(xml, 2)).toEqual(['One', 'Two']);
  });

  test('uses fallback title when missing', () => {
    const xml = `<rss><channel><item></item></channel></rss>`;

    expect(parseNewsItems(xml, 5)).toEqual(['No title']);
  });

  test('returns empty array when there are no items', () => {
    const xml = `<rss><channel></channel></rss>`;

    expect(parseNewsItems(xml, 5)).toEqual([]);
  });
});

test('throws error for invalid input', () => {
  expect(() => parseNewsItems(null)).toThrow();
});