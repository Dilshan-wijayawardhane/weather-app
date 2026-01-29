const apiKey = "787f001d355f88d21711a56f32efcd60";
const searchButton = document.getElementById("search-btn");
const locationInput = document.getElementById("location");
const weatherinfo = document.getElementById("weather-info");
const errorMessage = document.getElementById("error-message");

searchButton.addEventListener("click", () => {
    const location = locationInput.value.trim();
    if (location !== "") {
        const cachedData = localStorage.getItem(location);

        if (cachedData) {
            displayWeather(JSON.parse(cachedData));
            getForecastData(location);
        } else {
            getWeatherData(location);
            getForecastData(location);
        }
    } else {
        showError("Please enter a location name");
    }
});

async function getWeatherData(location) {
    try {
        const response = await fetch(`weather.php?city=${location}`);
        const data = await response.json();

        if (data.error) {
            showError(data.error);
        } else {
            displayWeather(data);
            localStorage.setItem(location, JSON.stringify(data));
        }
    } catch (error) {
        showError("An error occurred while fetching the weather data");
    }
}

async function getForecastData(location) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            displayForecast(data);
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError("An error occurred while fetching the forecast data");
    }
}

function displayWeather(data) {
    weatherinfo.innerHTML = `
        <h2>${data.city_name}, ${data.country_code}</h2>
        <p>${data.description}</p>
        <h3>${data.temperature}°C</h3>
        <p>Humidity: ${data.humidity}%</p>
        <p>Wind speed: ${data.wind_speed} m/s</p>
    `;
    errorMessage.textContent = "";
}

function displayForecast(data) {
    const forecastContainer = document.querySelectorAll(".day");
    const forecastDays = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    forecastDays.forEach((daydata, index) => {
        if (index < forecastContainer.length) {
            const date = new Date(daydata.dt_txt);
            const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });

            forecastContainer[index].innerHTML = `
                <h3>${dayOfWeek}</h3>
                <p>${daydata.weather[0].description}</p>
                <h4>${daydata.main.temp}°C</h4>
                <p>Humidity: ${daydata.main.humidity}%</p>
                <p>Wind speed: ${daydata.wind.speed} m/s</p>
            `;
        }
    });
}

function showError(message) {
    errorMessage.textContent = message;
    weatherinfo.innerHTML = "";

    const forecastContainers = document.querySelectorAll(".day");
    forecastContainers.forEach(container => container.innerHTML = "");
}
