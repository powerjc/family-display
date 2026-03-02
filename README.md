# Family Display

A simple web-based family command center for displaying schedules, lunch menus, reminders, and upcoming events on a tablet.

Perfect for repurposing an old Android tablet into a kitchen/entryway information display.

## Features

- 🗓️ Daily schedule display
- 🍎 School lunch menu
- 📝 Reminders and priorities
- 📅 Upcoming events
- 🌡️ Weather display (optional)
- 🔄 Auto-refresh every 60 seconds
- 🔐 Secure API for remote updates
- 📱 Optimized for tablets (responsive design)

## Quick Start

### 1. Setup

```bash
git clone https://github.com/powerjc/family-display.git
cd family-display

# Create data file and environment config
cp data/display.json.example data/display.json
cp .env.example .env

# Generate secure API token
openssl rand -hex 32
# Edit .env and set API_TOKEN to the generated value
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up -d

# View logs
docker-compose logs -f
```

Server runs at `http://localhost:8080`

### 3. Run with Python (Quick Test)

```bash
python3 server_api.py
```

Server runs at `http://localhost:8080`

### 4. Deploy to Tablet

**Access from tablet on same network:**
- Find your server's IP: `ip addr show` or `ifconfig`
- On tablet browser, go to `http://YOUR-SERVER-IP:8080`

**Set up kiosk mode (recommended):**
1. Install **Fully Kiosk Browser** from Play Store (or F-Droid for older devices)
2. Open Fully Kiosk settings → **Kiosk Mode**
3. Set start URL: `http://YOUR-SERVER-IP:8080`
4. Enable **Auto-reload** (60 seconds)
5. Enable **Keep screen on**
6. Enable **Kiosk mode** (locks tablet to this page)

## How It Works

### Data Flow

1. Update `data/display.json` (manually, via script, or via API)
2. Web page auto-refreshes every 60 seconds
3. JavaScript fetches latest JSON and updates display

### Updating Content

**Method 1: Edit the file directly**
```bash
vim data/display.json
# The page picks up changes on next auto-refresh (60 seconds)
```

**Method 2: Use the API**
```bash
curl -X POST http://localhost:8080/api/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "lunch": {
      "items": ["Pizza", "Salad", "Fruit"],
      "note": "Today's menu"
    }
  }'
```

**Method 3: Use the helper script**
```python
import os
os.environ['FAMILY_DISPLAY_URL'] = 'http://localhost:8080'
os.environ['FAMILY_DISPLAY_TOKEN'] = 'your-token-here'

from update_family_display_api import update_lunch
update_lunch(['Pizza', 'Salad', 'Fruit'])
```

## AI Assistant Integration

This project was designed to integrate with AI assistants (like Claude, ChatGPT, etc.) for automated updates:

```python
# Example: Update lunch menu from school website scraper
import requests

def update_family_display(data):
    response = requests.post(
        'http://your-server:8080/api/update',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {os.environ["FAMILY_DISPLAY_TOKEN"]}'
        },
        json=data
    )
    return response.json()

# Your AI assistant can call this to push updates
update_family_display({
    'lunch': {'items': scraped_menu_items, 'note': None}
})
```

## Next Steps

- [ ] Add weather API integration
- [ ] Connect to Google Calendar for schedule
- [ ] Add chore tracking
- [ ] Integrate lunch menu automation
- [ ] Add photo slideshow mode
- [ ] Voice control integration

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (no dependencies!)
- **Backend:** Python simple HTTP server
- **Data:** JSON file
- **Display:** Any web browser (optimized for tablet)

## API Endpoints

### GET /
Main display page (HTML)

### GET /data/display.json
Current display data (JSON)

### POST /api/update
Update display data

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_API_TOKEN`

**Body:**
```json
{
  "schedule": [...],
  "lunch": {...},
  "reminders": [...],
  "upcoming": [...]
}
```

Data is merged with existing content (partial updates supported).

## Configuration

### Environment Variables (.env)

```bash
API_TOKEN=your-secure-token-here  # Generate with: openssl rand -hex 32
PORT=8080                         # Server port (default 8080)
TZ=America/Chicago                # Timezone for timestamps
```

### Data Format (data/display.json)

See `data/display.json.example` for complete structure.

## File Structure

```
family-display/
├── server_api.py               # Python HTTP server with API
├── server.py                   # Simple HTTP server (no API)
├── update_display.py           # Helper script for local file updates
├── docker-compose.yml          # Docker deployment config
├── Dockerfile                  # Container image definition
├── .env.example                # Environment variable template
├── static/
│   ├── index.html             # Main display page
│   ├── style.css              # Styling
│   └── app.js                 # JavaScript logic
└── data/
    ├── display.json           # Live data (git-ignored)
    └── display.json.example   # Example/template data
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Pull requests welcome! Some ideas:
- Weather API integrations (OpenWeatherMap, Weather.gov)
- Google Calendar sync
- Chore tracking and rotation
- Photo slideshow mode
- Dark mode toggle
- Custom themes

## Credits

Built with vanilla JavaScript (no frameworks!) for maximum simplicity and compatibility with older tablets.
