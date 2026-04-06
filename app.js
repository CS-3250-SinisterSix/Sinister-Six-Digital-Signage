const screen = document.getElementById("screen");

let slides = [];
let currentIndex = 0;

async function loadConfig() {
  const response = await fetch("config.json");
  slides = await response.json();
  showSlide();
}

function showSlide() {
  const slide = slides[currentIndex];
    if (window.clockInterval) {
  clearInterval(window.clockInterval);
}
  if (slide.type === "text") {
    screen.innerHTML = `<div>${slide.message}</div>`;
  } 
  else if (slide.type === "image") {
    screen.innerHTML = `<img src="${slide.url}" style="max-width:100%; max-height:100%;">`;
  }
  else if (slide.type === "clock") {
    renderClock();
    }
  else {
    screen.textContent = "Unknown slide type";
  }

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide();
  }, slide.cycle * 1000);
}

function renderClock() {
  updateClock();

  // update every second
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
  }

  window.clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });

  screen.innerHTML = `<div style="font-size:5rem;">${time}</div>`;
}

loadConfig();