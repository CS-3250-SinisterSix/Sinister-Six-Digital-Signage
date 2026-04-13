async function loadConfig() {
  try {
    const response = await fetch("config.json");

    if (!response.ok) {
      throw new Error("Failed to load config");
    }

    const config = await response.json();

    // Update title
    document.getElementById("title").textContent = config.title;

    // Update announcements
    const announcementsContainer = document.getElementById("announcements");
    announcementsContainer.innerHTML = "";

    config.announcements.forEach(item => {
      const p = document.createElement("p");
      p.textContent = item;
      announcementsContainer.appendChild(p);
    });

    // Update footer
    document.getElementById("footer-text").textContent = config.footer;

  } catch (error) {
    console.error("Config error:", error);
  }
}

// ================= CLOCK =================
function updateClock() {
  const clockElement = document.querySelector(".clock");
  const dateElement = document.querySelector(".date");

  const now = new Date();

  const timeString = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const dateString = now.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  clockElement.textContent = timeString;
  dateElement.textContent = dateString;
}


// ================= WEATHER DISPLAY =================
function updateWeatherDisplay(temp, condition) {
  const tempElement = document.getElementById("weather-temp");
  const conditionElement = document.getElementById("weather-condition");

  tempElement.textContent = temp;
  conditionElement.textContent = condition;
}


// ================= WEATHER CODE MAP =================
function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherCodes[code] || "Unknown weather";
}


// ================= WEATHER FETCH =================
const WEATHER_LOCATION = "Denver";

async function getCoordinates(locationName) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
  );

  if (!response.ok) throw new Error("Failed to fetch location data.");

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Location not found.");
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude
  };
}

async function fetchWeather() {
  try {
    const coords = await getCoordinates(WEATHER_LOCATION);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    );

    if (!response.ok) throw new Error("Failed to fetch weather data.");

    const data = await response.json();

    const temperature = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const description = getWeatherDescription(weatherCode);

    updateWeatherDisplay(`${temperature}°F`, description);

  } catch (error) {
    console.error("Weather error:", error);
    updateWeatherDisplay("--°F", "Weather unavailable");
  }
}


// ================= RUN APP =================
updateClock();
setInterval(updateClock, 1000);

fetchWeather();

loadConfig();