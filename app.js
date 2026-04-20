let newsHeadlines = [];
let currentHeadlineIndex = 0;

async function loadConfig() {
  try {
    const response = await fetch('config.json');

    if (!response.ok) {
      throw new Error('Failed to load config');
    }

    const config = await response.json();

    // Update title
    document.getElementById('title').textContent = config.title;

    // Update footer
    document.getElementById('footer-text').textContent = config.footer;

    if (config.backgroundImage) {
      document.body.style.backgroundImage = `url(${config.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }

    if (config.backgrounds) {
      const startSlideshow = (selector, images, interval = config.backgrounds?.imageTime ?? 10) => {
        if (!images || images.length === 0) return;

        const el = document.querySelector(selector);
        if (!el) return;

        let index = 0;

        const applyImage = () => {
          el.style.backgroundImage = `url(${images[index]})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.style.backgroundRepeat = 'no-repeat';
        };

        // initial image
        applyImage();

        // rotate images
        setInterval(() => {
          index = (index + 1) % images.length;
          applyImage();
        }, interval * 1000);
      };

      startSlideshow('.clock-panel', config.backgrounds.clock);
      startSlideshow('.weather-panel', config.backgrounds.weather);
      startSlideshow('.announcements-panel', config.backgrounds.announcements);
      startSlideshow('.extra-panel', config.backgrounds.extra);
      startSlideshow('.footer', config.backgrounds.footer);
    }
  } catch (error) {
    console.error('Config error:', error);
  }
}

// ================= CLOCK =================
function updateClock() {
  const clockElement = document.querySelector('.clock');
  const dateElement = document.querySelector('.date');

  const now = new Date();

  const timeString = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  clockElement.textContent = timeString;
  dateElement.textContent = dateString;
}

// ================= WEATHER DISPLAY =================
function updateWeatherDisplay(location, temp, condition) {
  const locationElement = document.getElementById('weather-location');
  const tempElement = document.getElementById('weather-temp');
  const conditionElement = document.getElementById('weather-condition');

  locationElement.textContent = location;
  tempElement.textContent = temp;
  conditionElement.textContent = condition;
}

// ================= WEATHER CODE MAP =================
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return weatherCodes[code] || 'Unknown weather';
}

// ================= WEATHER FETCH =================
const WEATHER_LOCATION = 'Denver';

async function getCoordinates(locationName) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
  );

  if (!response.ok) throw new Error('Failed to fetch location data.');

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Location not found.');
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    admin1: data.results[0].admin1,
    country: data.results[0].country,
  };
}

async function fetchWeather() {
  try {
    const coords = await getCoordinates(WEATHER_LOCATION);
    const locationDisplay = coords.admin1
      ? `${coords.name}, ${coords.admin1}`
      : `${coords.name}, ${coords.country}`;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    );

    if (!response.ok) throw new Error('Failed to fetch weather data.');

    const data = await response.json();

    const temperature = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const description = getWeatherDescription(weatherCode);

    updateWeatherDisplay(locationDisplay, `${temperature}°F`, description);
  } catch (error) {
    console.error('Weather error:', error);
    updateWeatherDisplay('Location unavailable', '--°F', 'Weather unavailable');
  }
}

function showHeadline() {
  const container = document.getElementById('news-container');

  if (newsHeadlines.length === 0) {
    container.innerHTML = "<p class='headline'>No news available</p>";
    return;
  }

  container.innerHTML = '';

  const p = document.createElement('p');
  p.className = 'headline';
  p.textContent = '• ' + newsHeadlines[currentHeadlineIndex];
  container.appendChild(p);
}

function rotateHeadline() {
  const headlineElement = document.querySelector('#news-container .headline');

  if (!headlineElement || newsHeadlines.length === 0) {
    return;
  }

  headlineElement.classList.add('fade-out');

  setTimeout(() => {
    currentHeadlineIndex = (currentHeadlineIndex + 1) % newsHeadlines.length;
    showHeadline();
  }, 800);
}

async function fetchNews() {
  const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const data = await response.json();
    const xmlText = data.contents;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const items = xmlDoc.querySelectorAll('item');

    newsHeadlines = Array.from(items)
      .slice(0, 5)
      .map((item) => item.querySelector('title')?.textContent || 'No title');

    currentHeadlineIndex = 0;
    showHeadline();
  } catch (error) {
    console.error('News error:', error);
    document.getElementById('news-container').innerHTML =
      '<p>News unavailable</p>';
  }
}

// ================= RUN APP =================
updateClock();
setInterval(updateClock, 1000);

fetchWeather();
setInterval(fetchWeather, 15 * 60 * 1000); // Refresh weather every 15 minutes

loadConfig();

fetchNews();
setInterval(fetchNews, 15 * 60 * 1000); // Refresh news every 15 minutes
setInterval(rotateHeadline, 5000); // Rotate headline every 5 seconds
