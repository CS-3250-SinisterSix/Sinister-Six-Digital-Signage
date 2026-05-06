export function updateWeatherDisplay(
  location,
  temp,
  humidity,
  condition,
  windSpeed,
  windDirection
) {
  const locationElement = document.getElementById('weather-location');
  const tempElement = document.getElementById('weather-temp');
  const humidityElement = document.getElementById('weather-humid');
  const conditionElement = document.getElementById('weather-condition');
  const windTextElement = document.getElementById('wind-text');
  const needle = document.querySelector('.arrow');

  windTextElement.textContent = `${windSpeed}\nmph`;
  needle.style.transform = 'rotate(' + windDirection + 'deg)';
  locationElement.textContent = location;
  tempElement.textContent = `Temperature: ${temp}`;
  humidityElement.textContent = `Humidity: ${humidity}`;
  conditionElement.textContent = condition;
}