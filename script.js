
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const statusMessage = document.getElementById("status-message");
const weatherResult = document.getElementById("weather-result");

const cityNameEl = document.getElementById("city-name");
const conditionTextEl = document.getElementById("condition-text");
const weatherIconEl = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  61: ["Rain", "🌧️"],
  71: ["Snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  95: ["Thunderstorm", "⛈️"],
};

// Run this when the form is submitted
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop page from reloading

  const city = cityInput.value.trim();

  if (city === "") {
    showMessage("Please enter a city name.", true);
    return;
  }

  showMessage("Loading...", false);
  weatherResult.hidden = true;

  // STEP 1: Convert city name to latitude & longitude
  const geoURL = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city);

  fetch(geoURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (geoData) {
      // If no city found, show error and stop
      if (!geoData.results || geoData.results.length === 0) {
        showMessage("City not found. Please check the spelling.", true);
        return;
      }

      const place = geoData.results[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const name = place.name + (place.country ? ", " + place.country : "");

      // STEP 2: Use lat/lon to get current weather
      const weatherURL =
        "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
        "&longitude=" + lon +
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code";

      fetch(weatherURL)
        .then(function (response) {
          return response.json();
        })
        .then(function (weatherData) {
          showWeather(name, weatherData.current);
        })
        .catch(function () {
          showMessage("Could not get weather data. Try again.", true);
        });
    })
    .catch(function () {
      showMessage("Something went wrong. Check your internet connection.", true);
    });
});

// Show the weather info on the page
function showWeather(name, current) {
  const code = current.weather_code;
  const info = weatherCodes[code] || ["Unknown", "🌡️"];

  cityNameEl.textContent = name;
  conditionTextEl.textContent = info[0];
  weatherIconEl.textContent = info[1];
  temperatureEl.textContent = Math.round(current.temperature_2m) + "°C";
  humidityEl.textContent = current.relative_humidity_2m + "%";
  windSpeedEl.textContent = current.wind_speed_10m + " km/h";

  statusMessage.hidden = true;
  weatherResult.hidden = false;
}

// Show a status/error message and hide the weather result
function showMessage(text, isError) {
  statusMessage.hidden = false;
  statusMessage.textContent = text;

  if (isError) {
    statusMessage.classList.add("error");
  } else {
    statusMessage.classList.remove("error");
  }
}