import { parseNewsItems } from '../news.js';

describe('parseNewsItems', () => {
  test('parses RSS titles, links, and thumbnails', () => {
    const xml = `
  <rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
    <item>
      <title>Headline 1</title>
      <link>https://example.com/story-1</link>
      <media:thumbnail url="https://example.com/image-1.jpg" />
    </item>
    <item>
      <title>Headline 2</title>
      <link>https://example.com/story-2</link>
      <media:thumbnail url="https://example.com/image-2.jpg" />
    </item>
  </channel></rss>
`;

    expect(parseNewsItems(xml, 5)).toEqual([
      {
        title: 'Headline 1',
        link: 'https://example.com/story-1',
        thumbnail: 'https://example.com/image-1.jpg',
      },
      {
        title: 'Headline 2',
        link: 'https://example.com/story-2',
        thumbnail: 'https://example.com/image-2.jpg',
      },
    ]);
  });

  test('limits number of news items', () => {
    const xml = `
      <rss><channel>
        <item><title>One</title><link>https://example.com/one</link></item>
        <item><title>Two</title><link>https://example.com/two</link></item>
        <item><title>Three</title><link>https://example.com/three</link></item>
      </channel></rss>
    `;

    expect(parseNewsItems(xml, 2)).toEqual([
      {
        title: 'One',
        link: 'https://example.com/one',
        thumbnail: null,
      },
      {
        title: 'Two',
        link: 'https://example.com/two',
        thumbnail: null,
      },
    ]);
  });

  test('uses fallback values when title, link, or thumbnail are missing', () => {
    const xml = `<rss><channel><item></item></channel></rss>`;

    expect(parseNewsItems(xml, 5)).toEqual([
      {
        title: 'No title',
        link: null,
        thumbnail: null,
      },
    ]);
  });

  test('uses media content as backup thumbnail', () => {
    const xml = `
  <rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
    <item>
      <title>Backup image</title>
      <link>https://example.com/backup</link>
      <media:content url="https://example.com/content-image.jpg" />
    </item>
  </channel></rss>
`;

    expect(parseNewsItems(xml, 5)).toEqual([
      {
        title: 'Backup image',
        link: 'https://example.com/backup',
        thumbnail: 'https://example.com/content-image.jpg',
      },
    ]);
  });

  test('returns empty array when there are no items', () => {
    const xml = `<rss><channel></channel></rss>`;

    expect(parseNewsItems(xml, 5)).toEqual([]);
  });

  test('throws error for invalid input', () => {
    expect(() => parseNewsItems(null)).toThrow();
  });
});