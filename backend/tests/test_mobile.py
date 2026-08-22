# tests/test_mobile.py - Test Mobile Server

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing health endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        
        print(f"Status: {data['status']}")
        print(f"Version: {data['version']}")
        print(f"Active connections: {data['active_connections']}")
        print("✅ Health check passed")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

def test_execute_command():
    """Test command execution"""
    print("\n⚡ Testing command execution...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/execute",
            json={"command": "open calculator"}
        )
        data = response.json()
        
        if data['success']:
            print(f"✅ Command executed: {data['response']}")
        else:
            print(f"❌ Command failed: {data.get('error')}")
    except Exception as e:
        print(f"❌ Execution failed: {e}")

def test_web_access():
    """Test web app access"""
    print("\n🌐 Testing web app...")
    
    try:
        response = requests.get(BASE_URL)
        
        if response.status_code == 200:
            print("✅ Web app accessible")
            print(f"Content length: {len(response.text)} bytes")
        else:
            print(f"❌ Web app returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Web app failed: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("VENOM AI - Mobile Server Tests")
    print("=" * 50)
    print("\n⚠️ Make sure server is running first!")
    print("Run: python mobile/server.py\n")
    
    time.sleep(2)
    
    test_health()
    test_web_access()
    test_execute_command()
    
    print("\n✅ Mobile tests complete!")