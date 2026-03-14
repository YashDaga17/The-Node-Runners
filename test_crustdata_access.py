#!/usr/bin/env python3
"""
Test Crustdata API access and available endpoints
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("CRUSTDATA_API_KEY")

def test_endpoints():
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test different endpoints to see what's available
    endpoints = [
        "https://api.crustdata.com/screener/web-search",
        "https://api.crustdata.com/screener/companies", 
        "https://api.crustdata.com/screener/people",
        "https://api.crustdata.com/data-lab/company-search"
    ]
    
    for endpoint in endpoints:
        print(f"\n🔍 Testing: {endpoint}")
        try:
            # Try a simple POST request
            resp = requests.post(endpoint, headers=headers, json={"query": "test"}, timeout=10)
            print(f"Status: {resp.status_code}")
            
            if resp.status_code == 403:
                try:
                    error_data = resp.json()
                    print(f"Error: {error_data}")
                except:
                    print(f"Error text: {resp.text}")
            elif resp.status_code == 200:
                print("✅ Endpoint accessible!")
            else:
                print(f"Response: {resp.text[:200]}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔑 Testing Crustdata API access...")
    print(f"API Key: {API_KEY[:8]}..." if API_KEY else "No API key found")
    test_endpoints()