
export function updateWeatherDisplay(location, temp, condition) {
  const locationElement = document.getElementById('weather-location');
  const tempElement = document.getElementById('weather-temp');
  const conditionElement = document.getElementById('weather-condition');

  locationElement.textContent = location;
  tempElement.textContent = temp;
  conditionElement.textContent = condition;
}