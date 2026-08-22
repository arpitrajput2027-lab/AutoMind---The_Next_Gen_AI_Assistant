# test_mobile_connection.py

import requests
import json

# Change this to your laptop's IP
LAPTOP_IP = "10.160.30.134"  # Or your actual IP like "192.168.1.100"
PORT = 8000

def test_health():
    """Test health endpoint"""
    print("🏥 Testing health...")
    url = f"http://{LAPTOP_IP}:{PORT}/health"
    
    try:
        response = requests.get(url, timeout=5)
        print(f"✅ Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_execute():
    """Test command execution"""
    print("\n⚡ Testing command execution...")
    url = f"http://{LAPTOP_IP}:{PORT}/execute"
    
    try:
        response = requests.post(
            url,
            json={"command": "open calculator"},
            timeout=30
        )
        print(f"✅ Status: {response.status_code}")
        result = response.json()
        print(f"Success: {result.get('success')}")
        print(f"Response: {result.get('response', 'N/A')}")
        return True
    except Exception as e:
        print(f"❌ Execute failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("VENOM AI - Mobile Connection Test")
    print("=" * 60)
    
    if test_health():
        test_execute()
    
    print("\n" + "=" * 60)