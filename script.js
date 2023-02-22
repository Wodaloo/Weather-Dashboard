const API_KEY = '241549dbc6e0f5cfbb5166308f1aaacb'; // Replace with your API key

const form = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherContainer = document.querySelector('#weather-container');
const forecastContainer = document.querySelector('#forecast-container');

// Handle form submissions
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const city = cityInput.value;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Error:', error);
            weatherContainer.innerHTML = '<p>There was an error retrieving weather data. Please try again.</p>';
        });
});

// Display weather data on the page
function displayWeatherData(forecastData) {
    const name = forecastData.city.name;
    const date = new Date();
    const temperature = forecastData.list[0].main.temp;
    const humidity = forecastData.list[0].main.humidity;
    const windSpeed = forecastData.list[0].wind.speed;
    const weatherData = `
    <h2>${name}</h2>
    <p>Date: ${date}</p>
    <p>Temperature: ${temperature} °C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind speed: ${windSpeed} m/s</p>
    `;

    weatherContainer.innerHTML = weatherData;

    const forecastList = forecastData.list.reduce((accumulator, forecastData) => {
        const date = new Date(forecastData.dt * 1000);
        const day = date.toLocaleDateString();

        if (!accumulator[day]) {
            accumulator[day] = [];
        }

        accumulator[day].push({
            date: date,
            icon: forecastData.weather[0].icon,
            temperature: forecastData.main.temp,
            humidity: forecastData.main.humidity,
            windSpeed: forecastData.wind.speed,
        });

        return accumulator;
    }, {});

    let forecastWeatherHTML = '<div class="forecast-weather">';

    for (let i = 0; i < forecastList.length; i++) {
        const forecastData = forecastList[i];
        const forecastDate = forecastData.date;
        const forecastTemperature = forecastData.temperature;
        const forecastHumidity = forecastData.humidity;
        const forecastWindSpeed = forecastData.windSpeed;
        const forecastWeatherIcon = forecastData.icon;

        const forecastHTML = `
                <div class="forecast-day">
                  <p>${forecastDate}</p>
                  <img src="http://openweathermap.org/img/w/${forecastWeatherIcon}.png" alt="weather icon">
                  <p>Temperature: ${forecastTemperature} °C</p>
                  <p>Humidity: ${forecastHumidity}%</p>
                  <p>Wind speed: ${forecastWindSpeed} m/s</p>
                </div>
              `;

        forecastWeatherHTML += forecastHTML;
    }

    forecastWeatherHTML += '</div>';

    weatherContainer.innerHTML += forecastWeatherHTML;

    Object.entries(forecastList).forEach(([day, dayForecastList]) => {
        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast');

        const dateElement = document.createElement('p');
        dateElement.textContent = day;

        const dailyTemperature = dayForecastList.reduce((sum, forecastData) => sum + forecastData.temperature, 0) / dayForecastList.length;
        const temperatureElement = document.createElement('p');
        temperatureElement.textContent = `Temperature: ${dailyTemperature.toFixed(1)} °C`;

        const dailyHumidity = dayForecastList.reduce((sum, forecastData) => sum + forecastData.humidity, 0) / dayForecastList.length;
        const humidityElement = document.createElement('p');
        humidityElement.textContent = `Humidity: ${dailyHumidity.toFixed(1)}%`;

        const dailyWindSpeed = dayForecastList.reduce((sum, forecastData) => sum + forecastData.wind
            , 0) / dayForecastList.length;
        const windSpeedElement = document.createElement('p');
        windSpeedElement.textContent = `Wind speed: ${dailyWindSpeed.toFixed(1)} m/s`;

        const iconElement = document.createElement('img');
        iconElement.src = `https://openweathermap.org/img/w/${dayForecastList[0].icon}.png`;

        forecastElement.append(dateElement, iconElement, temperatureElement, humidityElement, windSpeedElement);
        forecastContainer.append(forecastElement);
    });
}




