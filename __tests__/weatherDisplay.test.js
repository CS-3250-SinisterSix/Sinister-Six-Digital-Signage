
import { updateWeatherDisplay } from '../weatherDisplay.js';

describe('updateWeatherDisplay', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="weather-location"></div>
      <div id="weather-temp"></div>
      <div id="weather-condition"></div>
    `;
  });

  test('updates the weather display text', () => {
    updateWeatherDisplay('Denver, CO', '72°F', 'Clear sky');

    expect(document.getElementById('weather-location').textContent).toBe(
      'Denver, CO'
    );
    expect(document.getElementById('weather-temp').textContent).toBe('72°F');
    expect(document.getElementById('weather-condition').textContent).toBe(
      'Clear sky'
    );
  });
});