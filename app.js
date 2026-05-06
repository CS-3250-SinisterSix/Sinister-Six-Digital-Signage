// ================= ORIENTATION TOGGLE =================

(function () {
  var dashboard = document.getElementById('dashboard');
  var button = document.getElementById('orientation-btn');

  function applyOrientation(mode) {
    dashboard.classList.remove('landscape', 'portrait');
    dashboard.classList.add(mode);
    button.textContent =
      mode === 'portrait' ? 'Switch to Landscape' : 'Switch to Portrait';
  }

  // Restore saved orientation
  var saved = localStorage.getItem('orientation');
  if (saved) {
    applyOrientation(saved);
  }

  button.addEventListener('click', function () {
    var isLandscape = dashboard.classList.contains('landscape');
    var next = isLandscape ? 'portrait' : 'landscape';
    applyOrientation(next);
    localStorage.setItem('orientation', next);
  });
})();

// ================= THEME TOGGLE =================

(function () {
  const themes = ['dark', 'light'];
  const themeLabels = {
    dark: 'Dark',
    light: 'Light',
  };
  const body = document.body;
  const button = document.getElementById('theme-btn');

  function applyTheme(theme) {
    body.classList.remove('theme-light', 'theme-branded');
    if (theme === 'light') body.classList.add('theme-light');
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    button.textContent = `Switch to ${themeLabels[next]}`;
  }

  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  button.addEventListener('click', function () {
    const current = localStorage.getItem('theme') || 'dark';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
})();

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

    if (config.weather && config.weather.location) {
      configWeatherLocation = config.weather.location;
    }

    // Apply theme from config (only if no user preference saved)
    if (config.theme && !localStorage.getItem('theme')) {
      localStorage.setItem('theme', config.theme);
      const themeBtn = document.getElementById('theme-btn');
      if (themeBtn) {
        themeBtn.click(); // triggers applyTheme via the button listener
      }
    }

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

        applyImage();

        setInterval(() => {
          index = (index + 1) % images.length;
          applyImage();
        }, interval * 1000);
      };

      startSlideshow('.clock-panel', config.backgrounds.clock);
      startSlideshow('.weather-panel', config.backgrounds.weather);
      startSlideshow('.announcements-panel', config.backgrounds.announcements);
      startSlideshow('.news-panel', config.backgrounds.news);
      startSlideshow('.footer', config.backgrounds.footer);
    }

    // Start RSS news cycling
    if (config.rss && config.rss.enabled) {
      const sourceEl = document.getElementById('news-source');
      if (sourceEl && config.rss.source) {
        sourceEl.textContent = config.rss.source;
      }
      fetchNews(
        config.rss.sources || [
          { name: config.rss.source, url: config.rss.url },
        ],
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

    // Start event countdown
    if (config.events && config.events.enabled && config.events.items) {
      const eventItems = config.events.items;
      const eventCycle = config.events.cycle || 10;

      if (eventItems.length > 0) {
        startEventCountdown('events-container', eventItems, eventCycle);
      }
    }

    // Start comic strip cycling
    if (config.comics && config.comics.enabled) {
      fetchComics(
        config.comics.feeds || [],
        config.comics.maxItems || 5,
        config.comics.cycle || 15
      );
    }
  } catch (error) {
    console.error('Config error:', error);
    document.getElementById('title').textContent =
      'Configuration could not be loaded';
    document.getElementById('title').classList.add('error-message');
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

function updateWeatherDisplay(
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

var configWeatherLocation = null;

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
      await getGeoCoords();
      coords = JSON.parse(localStorage.getItem('geoCoords'));

      location = await geocodeLatLng(coords.latitude, coords.longitude);

      locationDisplay = location.principalSubdivision
        ? `${location.city}, ${location.principalSubdivision}, ${location.countryCode}`
        : `${location.city}, ${location.countryCode}`;
    } else {
      const stored = localStorage.getItem('weatherCity');
      if (stored) {
        WEATHER_LOCATION = JSON.parse(stored).city;
      } else if (configWeatherLocation) {
        WEATHER_LOCATION = configWeatherLocation;
      } else {
        throw new Error('No weather location configured');
      }
      coords = await getCoordinates(WEATHER_LOCATION);

      locationDisplay = coords.admin1
        ? `${coords.name}, ${coords.admin1}, ${coords.country}`
        : `${coords.name}, ${coords.country}`;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`
    );

    if (!response.ok) throw new Error('Failed to fetch weather data.');

    const data = await response.json();

    const temperature = Math.round(data.current.temperature_2m);
    const humidity = data.current.relative_humidity_2m;
    const windSpeed = Math.round(data.current.wind_speed_10m);
    const windDirection = data.current.wind_direction_10m;
    const weatherCode = data.current.weather_code;
    const description = getWeatherDescription(weatherCode);

    updateWeatherDisplay(
      locationDisplay,
      `${temperature}°F`,
      `${humidity}%`,
      description,
      windSpeed,
      windDirection
    );
  } catch (error) {
    console.error('Weather error:', error);
    updateWeatherDisplay(
      'Location unavailable',
      '--°F',
      '--%',
      'Weather unavailable'
    );
  }
}

// ================= RSS NEWS =================

function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs);

  return fetch(url, { signal: controller.signal }).finally(function () {
    clearTimeout(timeoutId);
  });
}

async function fetchNews(rssSources, maxItems, cycleSec) {
  const sources = Array.isArray(rssSources) ? rssSources : [rssSources];

  try {
    let newsItems = [];

    for (const source of sources) {
      try {
        console.log('Trying RSS source:', source.name);

        const proxyUrls = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(source.url)}`,
        ];

        let xmlText = null;

        for (const proxyUrl of proxyUrls) {
          try {
            console.log('Trying proxy:', proxyUrl);

            const response = await fetchWithTimeout(proxyUrl, 5000);

            if (!response.ok) {
              throw new Error('Bad response');
            }

            xmlText = await response.text();

            if (xmlText && xmlText.length > 0) {
              console.log('Proxy success');
              break;
            }
          } catch (err) {
            console.warn('Proxy failed:', proxyUrl, err);
          }
        }

        if (!xmlText) {
          throw new Error('All proxies failed');
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('Invalid RSS XML');
        }

        const items = xmlDoc.querySelectorAll('item');

        newsItems = Array.from(items)
          .slice(0, maxItems)
          .map(function (item) {
            const thumbnail =
              item
                .querySelector('media\\:thumbnail, thumbnail')
                ?.getAttribute('url') ||
              item
                .querySelector('media\\:content, content')
                ?.getAttribute('url') ||
              null;

            return {
              title: item.querySelector('title')?.textContent || 'No title',
              link: item.querySelector('link')?.textContent || null,
              thumbnail: thumbnail,
            };
          });

        if (newsItems.length > 0) {
          const sourceEl = document.getElementById('news-source');

          if (sourceEl && source.name) {
            sourceEl.textContent = source.name;
          }

          break;
        }
      } catch (error) {
        console.warn('RSS source failed:', source.name, error);
      }
    }

    if (newsItems.length === 0) {
      throw new Error('No news items found');
    }

    startCycler(
      'news-container',
      newsItems,
      function (item) {
        const wrapper = document.createElement('div');
        wrapper.className = item.thumbnail
          ? 'news-item'
          : 'news-item no-thumbnail';

        if (item.thumbnail) {
          const img = document.createElement('img');
          img.className = 'news-thumbnail';
          img.src = item.thumbnail;
          img.alt = item.title;

          img.onerror = function () {
            img.style.display = 'none';
          };

          wrapper.appendChild(img);
        }

        const headline = document.createElement('p');
        headline.className = 'news-headline';
        headline.textContent = '\u2022 ' + item.title;
        wrapper.appendChild(headline);

        if (item.link) {
          const qr = document.createElement('img');
          qr.className = 'news-qr';
          qr.alt = 'QR code for article';
          qr.src =
            'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' +
            encodeURIComponent(item.link);

          qr.onerror = function () {
            qr.style.display = 'none';
          };

          wrapper.appendChild(qr);
        }

        return wrapper;
      },
      cycleSec
    );
  } catch (error) {
    console.error('News error:', error);
    document.getElementById('news-container').innerHTML =
      '<p class="error-message">Feed unavailable</p>';
  }
}

// ================= EVENT COUNTDOWN =================

function startEventCountdown(containerId, events, cycleSec) {
  const container = document.getElementById(containerId);
  let index = 0;
  let tickInterval = null;

  function calcRemaining(targetDate) {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days: days, hours: hours, minutes: minutes, seconds: seconds };
  }

  function renderCountdown(event) {
    const wrapper = document.createElement('div');
    wrapper.className = 'countdown-wrapper';

    const nameEl = document.createElement('div');
    nameEl.className = 'countdown-event-name';
    nameEl.textContent = event.name;
    wrapper.appendChild(nameEl);

    const target = new Date(event.date);
    const remaining = calcRemaining(target);

    if (!remaining) {
      const passed = document.createElement('div');
      passed.className = 'countdown-passed';
      passed.textContent = 'Event started!';
      wrapper.appendChild(passed);
    } else {
      const digits = document.createElement('div');
      digits.className = 'countdown-digits';

      var units = [
        { value: remaining.days, label: 'Days' },
        { value: remaining.hours, label: 'Hours' },
        { value: remaining.minutes, label: 'Minutes' },
        { value: remaining.seconds, label: 'Seconds' },
      ];

      units.forEach(function (unit) {
        const unitEl = document.createElement('div');
        unitEl.className = 'countdown-unit';

        const valEl = document.createElement('div');
        valEl.className = 'countdown-value';
        valEl.textContent = String(unit.value).padStart(2, '0');
        unitEl.appendChild(valEl);

        const labelEl = document.createElement('div');
        labelEl.className = 'countdown-label';
        labelEl.textContent = unit.label;
        unitEl.appendChild(labelEl);

        digits.appendChild(unitEl);
      });

      wrapper.appendChild(digits);
    }

    return wrapper;
  }

  function updateTick() {
    const wrapper = container.querySelector('.countdown-wrapper');
    if (!wrapper) return;

    const event = events[index];
    const target = new Date(event.date);
    const remaining = calcRemaining(target);

    const digits = wrapper.querySelector('.countdown-digits');
    if (!digits) return;

    if (!remaining) {
      wrapper.innerHTML = '';
      const nameEl = document.createElement('div');
      nameEl.className = 'countdown-event-name';
      nameEl.textContent = event.name;
      wrapper.appendChild(nameEl);
      const passed = document.createElement('div');
      passed.className = 'countdown-passed';
      passed.textContent = 'Event started!';
      wrapper.appendChild(passed);
      return;
    }

    const values = digits.querySelectorAll('.countdown-value');
    values[0].textContent = String(remaining.days).padStart(2, '0');
    values[1].textContent = String(remaining.hours).padStart(2, '0');
    values[2].textContent = String(remaining.minutes).padStart(2, '0');
    values[3].textContent = String(remaining.seconds).padStart(2, '0');
  }

  function show() {
    container.innerHTML = '';
    const el = renderCountdown(events[index]);
    container.appendChild(el);
  }

  function next() {
    const current = container.querySelector('.countdown-wrapper');
    if (current) {
      current.classList.add('fade-out');
    }

    setTimeout(function () {
      index = (index + 1) % events.length;
      show();
    }, 800);
  }

  show();
  tickInterval = setInterval(updateTick, 1000);
  const cycleInterval = setInterval(next, cycleSec * 1000);

  return {
    stop: function () {
      clearInterval(tickInterval);
      clearInterval(cycleInterval);
    },
  };
}

// ================= COMIC STRIP =================

/**
 * Extracts the first <img src> from an HTML string (RSS description fields).
 *
 * @param {string} html - Raw HTML string
 * @returns {string|null} Image URL or null
 */
function extractImgFromDescription(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Fetches comics from one or more webcomic RSS feeds and cycles through them.
 *
 * @param {Array} feeds - Array of { name, url } feed objects
 * @param {number} maxItems - Max comics to show per feed
 * @param {number} cycleSec - Seconds between comic rotations
 */
async function fetchComics(feeds, maxItems, cycleSec) {
  const container = document.getElementById('comics-container');

  try {
    let comicItems = [];

    for (const feed of feeds) {
      try {
        console.log('Trying comic feed:', feed.name);

        const proxyUrls = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feed.url)}`,
        ];

        let xmlText = null;

        for (const proxyUrl of proxyUrls) {
          try {
            const response = await fetchWithTimeout(proxyUrl, 5000);
            if (!response.ok) throw new Error('Bad response');
            xmlText = await response.text();
            if (xmlText && xmlText.length > 0) break;
          } catch (err) {
            console.warn('Comic proxy failed:', proxyUrl, err);
          }
        }

        if (!xmlText) throw new Error('All proxies failed for ' + feed.name);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) throw new Error('Invalid RSS XML for ' + feed.name);

        const items = xmlDoc.querySelectorAll('item');

        const parsed = Array.from(items)
          .slice(0, maxItems)
          .map(function (item) {
            const imgUrl =
              item
                .querySelector('media\\:content, content')
                ?.getAttribute('url') ||
              item
                .querySelector('media\\:thumbnail, thumbnail')
                ?.getAttribute('url') ||
              item.querySelector('enclosure')?.getAttribute('url') ||
              extractImgFromDescription(
                item.querySelector('description')?.textContent
              ) ||
              null;

            return {
              title: item.querySelector('title')?.textContent || 'No title',
              img: imgUrl,
              source: feed.name,
            };
          })
          .filter((item) => item.img !== null);

        if (parsed.length > 0) {
          comicItems = comicItems.concat(parsed);
          console.log(`Got ${parsed.length} comics from ${feed.name}`);
        }
      } catch (err) {
        console.warn('Comic feed failed:', feed.name, err);
      }
    }

    if (comicItems.length === 0) {
      throw new Error('No comic images found from any feed');
    }

    startCycler(
      'comics-container',
      comicItems,
      function (item) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comic-item';

        const img = document.createElement('img');
        img.className = 'comic-img';
        img.src = item.img;
        img.alt = item.title;
        img.onerror = function () {
          img.style.display = 'none';
          const fallback = document.createElement('p');
          fallback.className = 'error-message';
          fallback.textContent = 'Comic unavailable';
          wrapper.appendChild(fallback);
        };
        wrapper.appendChild(img);

        const title = document.createElement('p');
        title.className = 'comic-title';
        title.textContent = item.title;
        wrapper.appendChild(title);

        const source = document.createElement('p');
        source.className = 'comic-source-label';
        source.textContent = item.source;
        wrapper.appendChild(source);

        return wrapper;
      },
      cycleSec
    );
  } catch (error) {
    console.error('Comics error:', error);
    if (container) {
      container.innerHTML = '<p class="error-message">Comics unavailable</p>';
    }
  }
}

// ================= RUN APP =================

updateClock();
setInterval(updateClock, 1000);

async function handleUpdate() {
  fetchWeather();
  setTimeout(fetchWeather, 5000);
}

document.getElementById('submitBtn').addEventListener('click', handleSubmit);
document.getElementById('Geolocation').addEventListener('change', handleUpdate);

loadConfig().then(() => {
  fetchWeather();
  setTimeout(fetchWeather, 5000);
  setInterval(fetchWeather, 5 * 60 * 1000);
});
