import { getWeatherDescription } from '../weather.js';

describe('getWeatherDescription', () => {
  test('returns clear sky for code 0', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
  });

  test('returns heavy rain for code 65', () => {
    expect(getWeatherDescription(65)).toBe('Heavy rain');
  });

  test('returns thunderstorm with heavy hail for code 99', () => {
    expect(getWeatherDescription(99)).toBe('Thunderstorm with heavy hail');
  });

  test('returns unknown weather for unmapped code', () => {
    expect(getWeatherDescription(999)).toBe('Unknown weather');
  });
});