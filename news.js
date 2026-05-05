export function parseNewsItems(xmlText, maxItems = 5) {
  if (!xmlText || typeof xmlText !== 'string') {
    throw new Error('Invalid RSS XML');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid RSS XML');
  }

  const items = xmlDoc.querySelectorAll('item');

  return Array.from(items)
    .slice(0, maxItems)
    .map(function (item) {
      const thumbnail =
        item.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') ||
        item.querySelector('media\\:content, content')?.getAttribute('url') ||
        null;

      return {
        title: item.querySelector('title')?.textContent || 'No title',
        link: item.querySelector('link')?.textContent || null,
        thumbnail: thumbnail,
      };
    });
}