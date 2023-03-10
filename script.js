// Set the API key for OpenWeatherMap
const API_KEY = '241549dbc6e0f5cfbb5166308f1aaacb'; // Replace with your API key

// Select elements from the DOM
const form = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherContainer = document.querySelector('#weather-container');
const forecastContainer = document.querySelector('#forecast-container');
const previousSearchesList = document.querySelector('#previous-searches-list');

// Handle form submissions
form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the city entered by the user and construct the API URL
    const city = cityInput.value;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    // Make a request to the OpenWeatherMap API and display the weather data
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
            storePreviousSearch(city);
        })
        .catch(error => {
            console.error('Error:', error);
            weatherContainer.innerHTML = '<p>There was an error retrieving weather data. Please try again.</p>';
        });
});

// Store previous search in localStorage
function storePreviousSearch(city) {
    let previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
    previousSearches.unshift(city);
    previousSearches = [...new Set(previousSearches)].slice(0, 5); // remove duplicates and limit to 5 searches
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
    displayPreviousSearches();
}

// Display previous searches in the list
function displayPreviousSearches() {
    const previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
    previousSearchesList.innerHTML = previousSearches.map(search => `<li>${search}</li>`).join('');

    // Add click event listener to each search history item
    const searchHistoryItems = previousSearchesList.querySelectorAll('li');
    searchHistoryItems.forEach(searchHistoryItem => {
        searchHistoryItem.addEventListener('click', () => {
            const selectedCity = searchHistoryItem.textContent;
            fetchWeatherData(selectedCity);
        });
    });
}

// Fetch weather data for the given city and display it on the page
function fetchWeatherData(city) {
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
            storePreviousSearch(city);
        })
        .catch(error => {
            console.error('Error:', error);
            weatherContainer.innerHTML = '<p>There was an error retrieving weather data. Please try again.</p>';
        });
}

// Display weather data on the page
function displayWeatherData(forecastData) {

    // Clear previous weather and forecast information
    weatherContainer.innerHTML = '';
    forecastContainer.innerHTML = '';

    // Extract relevant data from the API response
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
    <p>Wind speed: ${windSpeed} m/s</p>`;

    // Display current weather information
    weatherContainer.innerHTML = weatherData;

    // Group forecast data by day
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

    Object.entries(forecastList).forEach(([day, dayForecastList]) => {
        // extract forecast data for this day
        const forecastData = dayForecastList[0];
        const forecastDate = forecastData.date;
        const forecastTemperature = forecastData.temperature;
        const forecastHumidity = forecastData.humidity;
        const forecastWindSpeed = forecastData.windSpeed;
        const forecastWeatherIcon = forecastData.icon;

        // create HTML for this forecast
        const forecastHTML = `
            <div class="forecast-day">
                <p>${forecastDate}</p>
                <img src="http://openweathermap.org/img/w/${forecastWeatherIcon}.png" alt="weather icon">
                <p>Temperature: ${forecastTemperature} °C</p>
                <p>Humidity: ${forecastHumidity}%</p>
                <p>Wind speed: ${forecastWindSpeed} m/s</p>
            </div>
        `;

        // add HTML to forecastWeatherHTML
        forecastWeatherHTML += forecastHTML;
    });


    forecastWeatherHTML += '</div>';

    weatherContainer.innerHTML += forecastWeatherHTML;

    Object.entries(forecastList
    ).forEach(([day, dayForecastList]) => {
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
