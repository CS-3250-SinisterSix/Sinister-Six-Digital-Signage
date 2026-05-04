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

  return Array.from(xmlDoc.querySelectorAll('item'))
    .slice(0, maxItems)
    .map((item) => item.querySelector('title')?.textContent || 'No title');
}