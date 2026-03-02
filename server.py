#!/usr/bin/env python3
"""
Simple HTTP server for family display.
Serves static files and provides data endpoint.
"""

import http.server
import socketserver
import os
from pathlib import Path

# Configuration
PORT = 8080
STATIC_DIR = Path(__file__).parent / "static"
DATA_DIR = Path(__file__).parent / "data"


class FamilyDisplayHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve static files and data."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        # Serve data.json from /data/display.json
        if self.path == '/data/display.json':
            self.path = str(DATA_DIR / 'display.json')
            try:
                with open(self.path, 'rb') as f:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Cache-Control', 'no-cache')
                    self.end_headers()
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404, 'Data file not found')
            return

        # Serve static files
        super().do_GET()


def main():
    """Start the family display server."""
    with socketserver.TCPServer(("", PORT), FamilyDisplayHandler) as httpd:
        print(f"Family Display server running at http://localhost:{PORT}")
        print(f"Serving from: {STATIC_DIR}")
        print(f"Data from: {DATA_DIR}")
        print("\nPress Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")


if __name__ == "__main__":
    main()
