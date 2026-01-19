const apiKey = "2df6f28df85285abaa1f77ab6712e214";
const currentUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric";

let isCelsius = true;

/*  INPUTS*/
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

/*  DASHBOARD */
const tempEl = document.querySelector(".temp");
const cityEl = document.querySelector(".city");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");
const conditionEl = document.querySelector(".condition");
const weatherIcon = document.querySelector(".weather-icon");

/* TODAY  */
const feelsEl = document.getElementById("feels");
const minTempEl = document.getElementById("minTemp");
const maxTempEl = document.getElementById("maxTemp");
const pressureEl = document.getElementById("pressure");

/* FORECAST  */
const forecastContainer = document.getElementById("forecastCards");

/* CITIES  */
const citiesList = document.getElementById("citiesList");

/*  SETTINGS  */
const unitToggle = document.getElementById("unitToggle");

/* SECTIONS  */
const menuItems = document.querySelectorAll(".menu li");
const sections = document.querySelectorAll(".section");

/* WEATHER */
async function checkWeather(city) {
    if (!city) return;

    try {
        const res = await fetch(currentUrl + city + `&appid=${apiKey}`);
        if (!res.ok) {
            alert("City not found");
            return;
        }

        const data = await res.json();

        cityEl.innerText = data.name;
        tempEl.innerText = formatTemp(data.main.temp);
        humidityEl.innerText = data.main.humidity + "%";
        windEl.innerText = data.wind.speed + " km/h";
        conditionEl.innerText = data.weather[0].main;
        updateIcon(data.weather[0].main);

        feelsEl.innerText = formatTemp(data.main.feels_like);
        pressureEl.innerText = data.main.pressure;

        await loadTodayMinMax(data.coord.lat, data.coord.lon);
        await loadForecast(data.coord.lat, data.coord.lon);

        saveCity(data.name);
        openSection("dashboard");

    } catch (err) {
        console.error(err);
    }
}

async function loadTodayMinMax(lat, lon) {
    const res = await fetch(`${forecastUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data = await res.json();

    const today = new Date().getDate();
    let temps = [];

    data.list.forEach(item => {
        const itemDate = new Date(item.dt_txt).getDate();
        if (itemDate === today) temps.push(item.main.temp);
    });

    if (temps.length) {
        minTempEl.innerText = formatTemp(Math.min(...temps));
        maxTempEl.innerText = formatTemp(Math.max(...temps));
    }
}

async function loadForecast(lat, lon) {
    const res = await fetch(`${forecastUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data = await res.json();

    forecastContainer.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) {
        const day = new Date(data.list[i].dt_txt)
            .toLocaleDateString("en-US", { weekday: "short" });

        const weather = data.list[i].weather[0].main;
        const temp = formatTemp(data.list[i].main.temp);

        forecastContainer.innerHTML += `
            <div class="forecast-card">
                <h4>${day}</h4>
                <img src="${getIcon(weather)}">
                <p>${temp}</p>
            </div>
        `;
    }
}

/* ICONS */
function updateIcon(weather) {
    weatherIcon.src = getIcon(weather);
}

function getIcon(weather) {
    switch (weather) {
        case "Clouds": return "Images/clouds.png";
        case "Rain":
        case "Thunderstorm": return "Images/rain.png";
        case "Drizzle": return "Images/drizzle.png";
        case "Snow": return "Images/snow.png";
        case "Mist":
        case "Haze":
        case "Fog":
        case "Smoke":
        case "Dust":
        case "Sand":
        case "Ash": return "Images/mist.png";
        default: return "Images/clear.png";
    }
}

/* HELPERS  */
function formatTemp(temp) {
    return isCelsius
        ? Math.round(temp) + "°C"
        : Math.round((temp * 9) / 5 + 32) + "°F";
}

/* SAVED CITIES  */
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
        renderCities();
    }
}

function renderCities() {
    const cities = JSON.parse(localStorage.getItem("cities")) || [];
    citiesList.innerHTML = "";

    cities.forEach(city => {
        const li = document.createElement("li");
        li.innerText = city;
        li.onclick = () => {
            checkWeather(city);
            openSection("dashboard");
            closeSidebar(); 
        };
        citiesList.appendChild(li);
    });
}

renderCities();

/*  EVENTS */
unitToggle.addEventListener("change", () => {
    isCelsius = !unitToggle.checked;
    if (cityEl.innerText !== "City") {
        checkWeather(cityEl.innerText);
    }
});

searchBtn.onclick = () => checkWeather(cityInput.value);
cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") checkWeather(cityInput.value);
});

menuItems.forEach(item => {
    item.onclick = () => {
        openSection(item.dataset.section);
        closeSidebar(); 
    };
});

/*  SECTIONS */
function openSection(sectionId) {
    menuItems.forEach(i => i.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active-section"));

    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
    document.getElementById(sectionId).classList.add("active-section");
}

/*  MOBILE SIDEBAR  */
function toggleMenu() {
    document.querySelector(".sidebar").classList.toggle("show");
}

function closeSidebar() {
    document.querySelector(".sidebar").classList.remove("show");
}

/* Close when clicking outside */
document.addEventListener("click", e => {
    const sidebar = document.querySelector(".sidebar");
    const menuBtn = document.querySelector(".menu-btn");

    if (
        sidebar.classList.contains("show") &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        closeSidebar();
    }
});
