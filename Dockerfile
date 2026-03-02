FROM python:3.11-slim

WORKDIR /app

# Copy application files
COPY static/ /app/static/
COPY server_api.py /app/
COPY update_display.py /app/

# Create data directory with initial data (use example as default)
COPY data/display.json.example /app/data/display.json

# Expose port
EXPOSE 8080

# Run server with API support
CMD ["python3", "server_api.py"]
