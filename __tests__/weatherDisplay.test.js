import { updateWeatherDisplay } from '../weatherDisplay.js';

describe('updateWeatherDisplay', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="weather-location"></div>
      <div id="weather-temp"></div>
      <div id="weather-humid"></div>
      <div id="weather-condition"></div>
      <div id="wind-text"></div>
      <div class="arrow"></div>
    `;
  });

  test('updates weather text and wind arrow', () => {
    updateWeatherDisplay('Denver, Colorado, US', '72°F', '45%', 'Clear sky', 12, 180);

    expect(document.getElementById('weather-location').textContent).toBe(
      'Denver, Colorado, US'
    );
    expect(document.getElementById('weather-temp').textContent).toBe(
      'Temperature: 72°F'
    );
    expect(document.getElementById('weather-humid').textContent).toBe(
      'Humidity: 45%'
    );
    expect(document.getElementById('weather-condition').textContent).toBe(
      'Clear sky'
    );
    expect(document.getElementById('wind-text').textContent).toBe('12\nmph');
    expect(document.querySelector('.arrow').style.transform).toBe(
      'rotate(180deg)'
    );
  });
});