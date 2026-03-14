#!/usr/bin/env python3
"""
Check if environment variables are loading correctly
"""
import os
from dotenv import load_dotenv

print("🔍 Checking environment setup...")

# Check if .env file exists
if os.path.exists('.env'):
    print("✅ .env file found")
    
    # Read .env file content
    with open('.env', 'r') as f:
        content = f.read()
        print(f"📄 .env content preview: {content[:50]}...")
else:
    print("❌ .env file not found")

# Load environment variables
load_dotenv()

# Check if API key is loaded
api_key = os.getenv("CRUSTDATA_API_KEY")
if api_key:
    print(f"✅ API key loaded successfully")
    print(f"📏 Length: {len(api_key)} characters")
    print(f"🔑 Starts with: {api_key[:8]}...")
else:
    print("❌ API key not loaded")
    print("Available env vars:", [k for k in os.environ.keys() if 'CRUST' in k.upper()])

# Test manual loading
print("\n🔧 Manual .env loading test:")
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                print(f"Found: {key} = {value[:8]}...")
except Exception as e:
    print(f"Error reading .env: {e}")