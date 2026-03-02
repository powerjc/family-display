#!/usr/bin/env python3
"""
Family Display Server with API endpoint for remote updates.
Serves static files and provides POST endpoint to update content.
"""

import http.server
import socketserver
import json
import os
from pathlib import Path
from urllib.parse import parse_qs
from datetime import datetime

# Configuration
PORT = int(os.getenv('PORT', 8080))
API_TOKEN = os.getenv('API_TOKEN', 'changeme-insecure-default')
STATIC_DIR = Path(__file__).parent / "static"
DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "display.json"


class FamilyDisplayHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve static files, data, and API endpoint."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        # Serve data.json from /data/display.json
        if self.path == '/data/display.json':
            try:
                with open(DATA_FILE, 'rb') as f:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Cache-Control', 'no-cache')
                    self.end_headers()
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404, 'Data file not found')
            return

        # Health check endpoint
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({"status": "ok", "timestamp": datetime.now().isoformat()})
            self.wfile.write(response.encode())
            return

        # Serve static files
        super().do_GET()

    def do_POST(self):
        # API endpoint to update display data
        if self.path == '/api/update':
            # Check authorization
            auth_header = self.headers.get('Authorization')
            if not auth_header or auth_header != f'Bearer {API_TOKEN}':
                self.send_error(401, 'Unauthorized')
                return

            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)

            try:
                updates = json.loads(body)

                # Load current data
                if DATA_FILE.exists():
                    current_data = json.loads(DATA_FILE.read_text())
                else:
                    current_data = {
                        "last_update": datetime.now().isoformat(),
                        "weather": {"temp": 0, "condition": "Unknown"},
                        "schedule": [],
                        "lunch": {"items": [], "note": None},
                        "reminders": [],
                        "upcoming": []
                    }

                # Apply updates
                current_data.update(updates)
                current_data['last_update'] = datetime.now().isoformat()

                # Save
                DATA_FILE.write_text(json.dumps(current_data, indent=2))

                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = json.dumps({
                    "status": "success",
                    "message": "Display updated",
                    "timestamp": current_data['last_update']
                })
                self.wfile.write(response.encode())

            except json.JSONDecodeError:
                self.send_error(400, 'Invalid JSON')
            except Exception as e:
                self.send_error(500, str(e))
            return

        self.send_error(404, 'Not found')


def main():
    """Start the family display server."""
    with socketserver.TCPServer(("", PORT), FamilyDisplayHandler) as httpd:
        print(f"Family Display server running at http://localhost:{PORT}")
        print(f"Serving from: {STATIC_DIR}")
        print(f"Data from: {DATA_DIR}")
        print(f"API endpoint: POST /api/update")
        print(f"API token: {API_TOKEN[:8]}..." if len(API_TOKEN) > 8 else "API token: (not set)")
        print("\nPress Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")


if __name__ == "__main__":
    main()
