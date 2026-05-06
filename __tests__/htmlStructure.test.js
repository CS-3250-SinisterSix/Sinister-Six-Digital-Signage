
import fs from 'fs';

describe('index.html structure', () => {
  let html;

  beforeAll(() => {
    html = fs.readFileSync('index.html', 'utf8');
    document.documentElement.innerHTML = html;
  });

  test('has weather elements required by app.js', () => {
    expect(document.getElementById('weather-location')).not.toBeNull();
    expect(document.getElementById('weather-temp')).not.toBeNull();
    expect(document.getElementById('weather-condition')).not.toBeNull();
  });

  test('has news elements required by app.js', () => {
    expect(document.getElementById('news-container')).not.toBeNull();
    expect(document.getElementById('news-source')).not.toBeNull();
  });

  test('has clock and date elements required by app.js', () => {
    expect(document.querySelector('.clock')).not.toBeNull();
    expect(document.querySelector('.date')).not.toBeNull();
  });
});

test('has theme button required by app.js', () => {
  expect(document.getElementById('theme-btn')).not.toBeNull();
});

test('has updated weather elements required by app.js', () => {
  expect(document.getElementById('weather-humid')).not.toBeNull();
  expect(document.getElementById('wind-text')).not.toBeNull();
  expect(document.querySelector('.arrow')).not.toBeNull();
});

test('has event and comics containers required by app.js', () => {
  expect(document.getElementById('events-container')).not.toBeNull();
  expect(document.getElementById('comics-container')).not.toBeNull();
});