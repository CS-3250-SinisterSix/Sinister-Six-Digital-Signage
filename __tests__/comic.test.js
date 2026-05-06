import { extractImgFromDescription } from '../comics.js';

describe('extractImgFromDescription', () => {
  test('extracts image src from description HTML', () => {
    const html = '<p>Comic</p><img src="https://example.com/comic.png">';
    expect(extractImgFromDescription(html)).toBe(
      'https://example.com/comic.png'
    );
  });

  test('returns null when no image exists', () => {
    expect(extractImgFromDescription('<p>No image here</p>')).toBeNull();
  });

  test('returns null for empty input', () => {
    expect(extractImgFromDescription('')).toBeNull();
    expect(extractImgFromDescription(null)).toBeNull();
  });
});