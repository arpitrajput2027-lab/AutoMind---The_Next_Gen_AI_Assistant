import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

SINRIC_API_KEY = os.getenv("SINRIC_API_KEY")
SINRIC_LIGHT_ID = os.getenv("SINRIC_FAN_ID")
SINRIC_FAN_ID = os.getenv("SINRIC_LIGHT_ID")
SINRIC_BASE_URL = "https://api.sinric.pro/api/v1/devices"

def set_device_power(device_id: str, device_label: str, turn_on: bool):
    """Calls Sinric Pro's REST API to set a device's power state."""
    # Re-fetch in case env was loaded after module import
    api_key = os.getenv("SINRIC_API_KEY", SINRIC_API_KEY)
    
    if not api_key:
        return f"Error: SINRIC_API_KEY is not set in .env"
    if not device_id:
        return f"Error: {device_label} ID is not set in .env"

    state = "On" if turn_on else "Off"
    url = f"{SINRIC_BASE_URL}/{device_id}/action"
    headers = {
        "X-SINRIC-API-KEY": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "type": "request",
        "action": "setPowerState",
        "value": json.dumps({"state": state}),
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        data = resp.json()
        if resp.ok and data.get("success"):
            return f"Success: {device_label} turned {state}"
        else:
            return f"Error: Failed to turn {state} {device_label}. Response: {data}"
    except requests.exceptions.RequestException as e:
        return f"Error connecting to Sinric API: {e}"

def turn_light_on():
    """Turns the light ON"""
    # Using FAN_ID for light because IDs were swapped on the ESP hardware
    return set_device_power(os.getenv("SINRIC_FAN_ID", SINRIC_FAN_ID), "Light", True)

def turn_light_off():
    """Turns the light OFF"""
    return set_device_power(os.getenv("SINRIC_FAN_ID", SINRIC_FAN_ID), "Light", False)

def turn_fan_on():
    """Turns the fan ON"""
    # Using LIGHT_ID for fan because IDs were swapped on the ESP hardware
    return set_device_power(os.getenv("SINRIC_LIGHT_ID", SINRIC_LIGHT_ID), "Fan", True)

def turn_fan_off():
    """Turns the fan OFF"""
    return set_device_power(os.getenv("SINRIC_LIGHT_ID", SINRIC_LIGHT_ID), "Fan", False)
