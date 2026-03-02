// Family Display App - Proof of Concept
// Fetches data from JSON file and updates display

const DATA_URL = '/data/display.json';
const REFRESH_INTERVAL = 60000; // 60 seconds

// Update clock
function updateClock() {
    const now = new Date();

    // Update time
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('current-time').textContent = timeStr;

    // Update date
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = dateStr;
}

// Fetch and update display data
async function updateDisplay() {
    try {
        const response = await fetch(DATA_URL);
        const data = await response.json();

        // Update weather
        updateWeather(data.weather);

        // Update today's schedule
        updateSchedule(data.schedule);

        // Update lunch menu
        updateLunchMenu(data.lunch);

        // Update reminders
        updateReminders(data.reminders);

        // Update upcoming events
        updateUpcoming(data.upcoming);

        // Update last update time
        document.getElementById('last-update').textContent =
            new Date(data.last_update).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

    } catch (error) {
        console.error('Error fetching display data:', error);
    }
}

function updateWeather(weather) {
    if (!weather) return;

    const weatherEl = document.getElementById('weather');
    weatherEl.innerHTML = `
        <span class="temp">${weather.temp}°</span>
        <span class="condition">${weather.condition}</span>
    `;
}

function updateSchedule(schedule) {
    const container = document.getElementById('today-schedule');

    if (!schedule || schedule.length === 0) {
        container.innerHTML = '<p class="empty">No events scheduled for today</p>';
        return;
    }

    container.innerHTML = schedule.map(item => `
        <div class="schedule-item">
            <div class="time">${item.time}</div>
            <div class="title">${item.title}</div>
            <div class="person">${item.person}</div>
        </div>
    `).join('');
}

function updateLunchMenu(lunch) {
    const container = document.getElementById('lunch-menu');

    if (!lunch || lunch.items.length === 0) {
        container.innerHTML = '<p class="empty">No school today</p>';
        return;
    }

    container.innerHTML = `
        <ul>
            ${lunch.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    if (lunch.note) {
        container.innerHTML += `<p style="margin-top: 15px; color: #667eea; font-weight: 600;">✨ ${lunch.note}</p>`;
    }
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

function updateUpcoming(upcoming) {
    const container = document.getElementById('upcoming');

    if (!upcoming || upcoming.length === 0) {
        container.innerHTML = '<p class="empty">Nothing scheduled this week</p>';
        return;
    }

    container.innerHTML = upcoming.map(item => `
        <div class="event">
            <div class="date">${item.date}</div>
            <div class="title">${item.title}</div>
        </div>
    `).join('');
}

// Initialize
updateClock();
setInterval(updateClock, 1000);

updateDisplay();
setInterval(updateDisplay, REFRESH_INTERVAL);
