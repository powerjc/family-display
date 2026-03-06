// Family Display App
// Fetches data from JSON file and updates display

const DATA_URL = '/data/display.json';
const REFRESH_INTERVAL = 60000; // 60 seconds

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Format a Date to match the backend's "%A, %b %d" format (zero-padded day)
function formatDateKey(d) {
    const day = String(d.getDate()).padStart(2, '0');
    return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${day}`;
}

// Update clock every second
function updateClock() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });
}

// Fetch and update all display data
async function updateDisplay() {
    try {
        const response = await fetch(DATA_URL);
        const data = await response.json();

        updateWeather(data.weather);
        updateForecast(data.forecast);
        updateSchedule(data.schedule);
        updateLunchMenu(data.lunch);
        updateReminders(data.reminders);
        updateWeekGrid(data.upcoming, data.forecast);

        document.getElementById('last-update').textContent =
            new Date(data.last_update).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
            });
    } catch (error) {
        console.error('Error fetching display data:', error);
    }
}

function updateWeather(weather) {
    if (!weather) return;
    document.getElementById('weather').innerHTML = `
        <span class="temp">${weather.temp}°</span>
        <span class="condition">${weather.condition}</span>
    `;
}

function updateForecast(forecast) {
    const container = document.getElementById('forecast');
    if (!forecast || forecast.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = forecast.map(day => `
        <div class="forecast-day-inline">
            <div class="day-name">${day.day.slice(0, 3)}</div>
            <div class="temps">${day.high}°<span class="low">/${day.low}°</span></div>
            ${day.precip ? `<div class="precip">💧 ${day.precip.replace(' chance', '')}</div>` : ''}
        </div>
    `).join('');
}

function updateSchedule(schedule) {
    const container = document.getElementById('today-schedule');
    if (!schedule || schedule.length === 0) {
        container.innerHTML = '<p class="empty">No events today</p>';
        return;
    }
    container.innerHTML = schedule.map(item => `
        <div class="schedule-item">
            <div class="time">${item.time}</div>
            <div class="title">${item.title}</div>
        </div>
    `).join('');
}

function updateLunchMenu(lunch) {
    const container = document.getElementById('lunch-menu');
    if (!lunch) {
        container.innerHTML = '';
        return;
    }

    // No School — show celebratory banner
    if (lunch.note && lunch.note.includes('NO SCHOOL')) {
        container.innerHTML = `
            <div style="text-align:center;padding:12px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:10px;color:white;">
                <div style="font-size:24px;margin-bottom:4px;">🎉🎊🥳</div>
                <div style="font-size:16px;font-weight:800;letter-spacing:1px;">NO SCHOOL!</div>
                <div style="font-size:13px;opacity:0.9;margin-top:2px;">🎈 Enjoy the day! 🎈</div>
            </div>`;
        return;
    }

    if (!lunch.items || lunch.items.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <ul>${lunch.items.map(item => `<li>${item}</li>`).join('')}</ul>
        ${lunch.note ? `<p style="margin-top:10px;color:#667eea;font-size:13px;font-weight:600;">✨ ${lunch.note}</p>` : ''}
    `;
}

function updateReminders(reminders) {
    const container = document.getElementById('reminders');
    if (!reminders || reminders.length === 0) {
        container.innerHTML = '<p class="empty">No reminders</p>';
        return;
    }
    container.innerHTML = reminders.map(item => `
        <div class="reminder ${item.priority === 'high' ? 'high-priority' : ''}">
            <div class="title">${item.text}</div>
        </div>
    `).join('');
}

function updateWeekGrid(upcoming, forecast) {
    const container = document.getElementById('upcoming');

    // Build event map: dateKey → [titles]
    const eventsByDate = {};
    (upcoming || []).forEach(item => {
        if (!eventsByDate[item.date]) eventsByDate[item.date] = [];
        eventsByDate[item.date].push(item.title);
    });

    // Build forecast map: day name → forecast data
    const forecastByDay = {};
    (forecast || []).forEach(f => { forecastByDay[f.day] = f; });

    // Generate 7 day columns starting today
    const today = new Date();
    const cols = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayName = DAY_NAMES[d.getDay()];
        const dateKey = formatDateKey(d);
        const events = eventsByDate[dateKey] || [];
        const fcast = forecastByDay[dayName];
        const isToday = i === 0;

        const eventsHtml = events.map(e =>
            `<div class="week-event" title="${e}">${e}</div>`
        ).join('');

        const forecastHtml = fcast
            ? `<div class="week-forecast">${fcast.high}°<span class="low">/${fcast.low}°</span></div>`
            : '';

        cols.push(`
            <div class="week-day${isToday ? ' week-today' : ''}">
                <div class="week-day-header">
                    <div class="week-day-name">${dayName.slice(0, 3)}</div>
                    <div class="week-day-date">${MONTH_NAMES[d.getMonth()]} ${d.getDate()}</div>
                    ${forecastHtml}
                </div>
                <div class="week-day-events">${eventsHtml}</div>
            </div>
        `);
    }

    container.innerHTML = cols.join('');
}

// Initialize
updateClock();
setInterval(updateClock, 1000);

updateDisplay();
setInterval(updateDisplay, REFRESH_INTERVAL);
