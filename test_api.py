#!/usr/bin/env python3
"""
Test script for the Job Search API
"""
import requests
import json

def test_job_search():
    url = "http://localhost:8000/api/search-jobs"
    
    # Test data
    test_cases = [
        {
            "role": "software engineer",
            "location": "US",
            "fetch_content": False
        },
        {
            "role": "python developer",
            "location": "US", 
            "fetch_content": False
        },
        {
            "role": "frontend developer",
            "location": "GB",
            "fetch_content": True
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i}: {test_case['role']} ---")
        
        try:
            response = requests.post(url, json=test_case, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Found {data['total_results']} results")
                print(f"Query: {data['query']}")
                
                # Show first 2 jobs
                for j, job in enumerate(data['jobs'][:2], 1):
                    print(f"\nJob {j}:")
                    print(f"  Title: {job['title']}")
                    print(f"  Domain: {job['domain']}")
                    print(f"  URL: {job['url']}")
                    print(f"  Snippet: {job['snippet'][:100]}...")
                    
                    if 'content' in job:
                        print(f"  Content length: {len(job['content'])} chars")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection failed. Make sure the server is running:")
            print("   uv run uvicorn main:app --reload")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Testing Job Search API...")
    test_job_search()