import requests
import sys
import json

def test_existing_user_login():
    """Test login with existing user credentials"""
    base_url = "https://job-hunt-hub-7.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    login_data = {
        "email": "alex@test.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{api_url}/auth/login", json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful with existing user")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')}")
            print(f"Email: {data.get('user', {}).get('email', 'Unknown')}")
            return True
        else:
            print(f"❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_existing_user_login()
    sys.exit(0 if success else 1)