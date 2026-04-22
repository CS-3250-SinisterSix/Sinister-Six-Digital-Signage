// ================= GENERIC CONTENT CYCLER =================

/**
 * Creates a cycling rotator for any list of items in a container.
 * Shows one item at a time with a fade transition.
 *
 * @param {string} containerId - DOM element ID to render into
 * @param {Array} items - Array of items to cycle through
 * @param {Function} renderFn - Function that takes an item and returns a DOM element
 * @param {number} cycleSec - Seconds between rotations
 * @returns {object} Controller with stop() method
 */
function startCycler(containerId, items, renderFn, cycleSec) {
  const container = document.getElementById(containerId);
  let index = 0;

  function show() {
    container.innerHTML = '';
    const el = renderFn(items[index]);
    el.classList.add('cycle-item');
    container.appendChild(el);
  }

  function next() {
    const current = container.querySelector('.cycle-item');
    if (current) {
      current.classList.add('fade-out');
    }

    setTimeout(() => {
      index = (index + 1) % items.length;
      show();
    }, 800);
  }

  show();
  const intervalId = setInterval(next, cycleSec * 1000);

  return {
    stop() {
      clearInterval(intervalId);
    },
  };
}

// ================= CONFIG =================

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

    // Full-page background image
    if (config.backgroundImage) {
      document.body.style.backgroundImage = `url(${config.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }

    // Per-panel background image slideshows
    if (config.backgrounds) {
      const startSlideshow = (
        selector,
        images,
        interval = config.backgrounds?.imageTime ?? 10
      ) => {
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
      startSlideshow('.news-panel', config.backgrounds.news);
      startSlideshow('.images-panel', config.backgrounds.images);
      startSlideshow('.footer', config.backgrounds.footer);
    }

    // Start RSS news cycling
    if (config.rss && config.rss.enabled) {
      const sourceEl = document.getElementById('news-source');
      if (sourceEl && config.rss.source) {
        sourceEl.textContent = config.rss.source;
      }
      fetchNews(
        config.rss.url,
        config.rss.maxItems || 5,
        config.rss.cycle || 6
      );
    }

    // Start announcements cycling
    if (config.announcements && config.announcements.items) {
      const items = config.announcements.items;
      const cycle = config.announcements.cycle || 8;

      if (items.length > 0) {
        startCycler(
          'announcements-container',
          items,
          function (text) {
            const p = document.createElement('p');
            p.textContent = text;
            return p;
          },
          cycle
        );
      }
    }

    // Start image cycling
    if (config.images && config.images.enabled && config.images.items) {
      const items = config.images.items;
      const cycle = config.images.cycle || 10;

      if (items.length > 0) {
        startCycler(
          'images-container',
          items,
          function (item) {
            const wrapper = document.createElement('div');

            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.caption || 'Signage image';
            img.onerror = function () {
              img.style.display = 'none';
              const fallback = document.createElement('p');
              fallback.textContent = 'Image not available';
              wrapper.appendChild(fallback);
            };
            wrapper.appendChild(img);

            if (item.caption) {
              const caption = document.createElement('p');
              caption.className = 'image-caption';
              caption.textContent = item.caption;
              wrapper.appendChild(caption);
            }

            return wrapper;
          },
          cycle
        );
      }
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

async function handleSubmit() {
  if (!document.getElementById('Geolocation').checked) {
    const cityInput = document.getElementById('cityName').value.trim();
    if (!cityInput) return;
    let CITY_LOCATION, data;
    try {
      CITY_LOCATION = cityInput;
    } catch (err) {
      throw new Error('Invalid city name. Error: ' + err.message);
    }
    data = { city: CITY_LOCATION };
    localStorage.setItem('weatherCity', JSON.stringify(data));
    fetchWeather();
  }
}

async function getCoordinates(locationName) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch location data.');
  }
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Location not found.');
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    admin1: data.results[0].admin1,
    country: data.results[0].country_code,
  };
}

async function getGeoCoords() {
  let lat;
  let lon;
  let coord;
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        lat = String(position.coords.latitude);
        lon = String(position.coords.longitude);
        coord = { latitude: lat, longitude: lon };
        localStorage.setItem('geoCoords', JSON.stringify(coord));
      },
      (error) => {
        throw new Error('Failed to get geolocation. Error: ' + error.message);
      }
    );
  } else {
    throw new Error('Geolocation is not supported by this browser.');
  }
}

async function geocodeLatLng(lat, lon) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await response.json();
    let location = data.principalSubdivision
      ? `${data.city}, ${data.principalSubdivision}`
      : `${data.city}, ${data.countryCode}`;

    localStorage.setItem('location', location);
    return {
      city: data.city,
      principalSubdivision: data.principalSubdivision,
      countryCode: data.countryCode,
    };
  } catch (error) {
    throw new Error(
      'Failed to reverse geocode coordinates. Error: ' + error.message
    );
  }
}

async function fetchWeather() {
  try {
    let coords;
    let locationDisplay;
    let location;
    let WEATHER_LOCATION;
    if (document.getElementById('Geolocation').checked) {
      //coords = await getGeoCoords();
      await getGeoCoords();
      coords = JSON.parse(localStorage.getItem('geoCoords'));

      location = await geocodeLatLng(coords.latitude, coords.longitude);

      locationDisplay = location.principalSubdivision
        ? `${location.city}, ${location.principalSubdivision}, ${location.countryCode}`
        : `${location.city}, ${location.countryCode}`;
    } else {
      WEATHER_LOCATION = JSON.parse(localStorage.getItem('weatherCity')).city;
      coords = await getCoordinates(WEATHER_LOCATION);

      locationDisplay = coords.admin1
        ? `${coords.name}, ${coords.admin1}, ${coords.country}`
        : `${coords.name}, ${coords.country}`;
    }

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

// ================= RSS NEWS =================

function fetchNews(rssUrl, maxItems, cycleSec) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

  fetch(proxyUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }
      return response.json();
    })
    .then(function (data) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      const headlines = Array.from(items)
        .slice(0, maxItems)
        .map(function (item) {
          return item.querySelector('title')?.textContent || 'No title';
        });

      if (headlines.length > 0) {
        startCycler(
          'news-container',
          headlines,
          function (text) {
            const p = document.createElement('p');
            p.textContent = '\u2022 ' + text;
            return p;
          },
          cycleSec
        );
      }
    })
    .catch(function (error) {
      console.error('News error:', error);
      document.getElementById('news-container').innerHTML =
        '<p>News unavailable</p>';
    });
}

// ================= RUN APP =================

updateClock();
setInterval(updateClock, 1000);

fetchWeather();
setTimeout(fetchWeather, 5000); // Initial weather fetch after 5 seconds
setTimeout(fetchWeather, 5000);
setInterval(fetchWeather, 5 * 60 * 1000); // Refresh weather every 5 minutes

if (!document.getElementById('Geolocation').checked) {
  document.getElementById('submitBtn').addEventListener('click', handleSubmit);
}

async function handleUpdate() {
  fetchWeather();
  setTimeout(fetchWeather, 5000); // Fetch weather again after 5 seconds to allow geolocation to update
}

if (document.getElementById('Geolocation').checked) {
  document
    .getElementById('Geolocation')
    .addEventListener('change', handleUpdate);
}

loadConfig();

fetchNews();
setInterval(fetchNews, 15 * 60 * 1000); // Refresh news every 15 minutes
//setInterval(rotateHeadline, 5000); // Rotate headline every 5 seconds
