#!/usr/bin/env python3
"""
Helper script for updating family display data.
Can be called from scheduled tasks or other scripts.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

DISPLAY_DATA = Path(__file__).parent / "data" / "display.json"


def load_current_data() -> Dict[str, Any]:
    """Load current display data."""
    if DISPLAY_DATA.exists():
        return json.loads(DISPLAY_DATA.read_text())
    return {
        "last_update": datetime.now().isoformat(),
        "weather": {"temp": 0, "condition": "Unknown"},
        "schedule": [],
        "lunch": {"items": [], "note": None},
        "reminders": [],
        "upcoming": []
    }


def save_data(data: Dict[str, Any]) -> None:
    """Save data to display file."""
    data["last_update"] = datetime.now().isoformat()
    DISPLAY_DATA.write_text(json.dumps(data, indent=2))
    print(f"Display updated at {data['last_update']}")


def update_lunch(items: List[str], note: str = None) -> None:
    """Update today's lunch menu."""
    data = load_current_data()
    data["lunch"] = {
        "items": items,
        "note": note
    }
    save_data(data)


def update_schedule(schedule: List[Dict[str, str]]) -> None:
    """Update today's schedule.

    Args:
        schedule: List of dicts with keys: time, title, person
    """
    data = load_current_data()
    data["schedule"] = schedule
    save_data(data)


def update_reminders(reminders: List[Dict[str, str]]) -> None:
    """Update reminders.

    Args:
        reminders: List of dicts with keys: text, priority (high/normal)
    """
    data = load_current_data()
    data["reminders"] = reminders
    save_data(data)


def update_upcoming(events: List[Dict[str, str]]) -> None:
    """Update upcoming events.

    Args:
        events: List of dicts with keys: date, title
    """
    data = load_current_data()
    data["upcoming"] = events
    save_data(data)


def update_weather(temp: int, condition: str) -> None:
    """Update weather display."""
    data = load_current_data()
    data["weather"] = {
        "temp": temp,
        "condition": condition
    }
    save_data(data)


def update_all(updates: Dict[str, Any]) -> None:
    """Update multiple sections at once."""
    data = load_current_data()
    data.update(updates)
    save_data(data)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 update_display.py <command> [args]")
        print("\nCommands:")
        print("  lunch <items...>     - Update lunch menu")
        print("  weather <temp> <condition> - Update weather")
        print("  show                 - Show current data")
        sys.exit(1)

    command = sys.argv[1]

    if command == "show":
        data = load_current_data()
        print(json.dumps(data, indent=2))

    elif command == "lunch":
        items = sys.argv[2:]
        update_lunch(items)
        print(f"Updated lunch menu with {len(items)} items")

    elif command == "weather":
        temp = int(sys.argv[2])
        condition = " ".join(sys.argv[3:])
        update_weather(temp, condition)
        print(f"Updated weather: {temp}° {condition}")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
