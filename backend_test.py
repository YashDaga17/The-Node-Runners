import requests
import sys
import json
import io
from datetime import datetime
from pathlib import Path

class JobHuntHubAPITester:
    def __init__(self, base_url="https://job-hunt-hub-7.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'resumes': [],
            'prompts': [],
            'applications': []
        }

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if data and not files:
            headers['Content-Type'] = 'application/json'
            data = json.dumps(data)

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, data=data, files=files)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, data=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            result_data = {}
            
            try:
                result_data = response.json()
            except:
                result_data = {"text": response.text}

            return success, response.status_code, result_data

        except Exception as e:
            return False, 0, {"error": str(e)}

    def test_auth_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        success, status, response = self.make_request('POST', 'auth/register', test_user, expected_status=200)
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return self.log_test("User Registration", True, f"- Token received, User ID: {self.user_id}")
        else:
            return self.log_test("User Registration", False, f"- Status: {status}, Response: {response}")

    def test_auth_login(self):
        """Test user login with existing credentials"""
        # Try to login with the registered user
        if not hasattr(self, 'test_email'):
            return self.log_test("User Login", False, "- No test user email available")
        
        login_data = {
            "email": self.test_email,
            "password": "TestPass123!"
        }
        
        success, status, response = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and 'token' in response:
            return self.log_test("User Login", True, f"- Token received")
        else:
            return self.log_test("User Login", False, f"- Status: {status}, Response: {response}")

    def test_auth_me(self):
        """Test get current user info"""
        if not self.token:
            return self.log_test("Get User Info", False, "- No token available")
        
        success, status, response = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and 'id' in response:
            return self.log_test("Get User Info", True, f"- User: {response.get('name', 'Unknown')}")
        else:
            return self.log_test("Get User Info", False, f"- Status: {status}, Response: {response}")

    def create_test_resume_file(self):
        """Create a test PDF content for resume upload"""
        # Create a simple text content that simulates a resume
        resume_content = """
John Doe
Software Engineer
Email: john.doe@example.com
Phone: (555) 123-4567

EXPERIENCE:
Senior Software Engineer at Tech Corp (2020-2023)
- Developed web applications using React and Node.js
- Led a team of 5 developers
- Implemented CI/CD pipelines

Software Engineer at StartupXYZ (2018-2020)
- Built REST APIs using Python and FastAPI
- Worked with MongoDB and PostgreSQL databases

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2014-2018)

SKILLS:
Python, JavaScript, React, Node.js, MongoDB, PostgreSQL, Docker, AWS
        """
        return resume_content.encode('utf-8')

    def test_resume_upload(self):
        """Test resume upload functionality"""
        if not self.token:
            return self.log_test("Resume Upload", False, "- No token available")
        
        # Create test file content
        file_content = self.create_test_resume_file()
        files = {
            'file': ('test_resume.pdf', io.BytesIO(file_content), 'application/pdf')
        }
        
        success, status, response = self.make_request('POST', 'resume/upload', files=files, expected_status=200)
        
        if success and 'id' in response:
            self.created_resources['resumes'].append(response['id'])
            return self.log_test("Resume Upload", True, f"- Resume ID: {response['id']}")
        else:
            return self.log_test("Resume Upload", False, f"- Status: {status}, Response: {response}")

    def test_get_resumes(self):
        """Test getting user's resumes"""
        if not self.token:
            return self.log_test("Get Resumes", False, "- No token available")
        
        success, status, response = self.make_request('GET', 'resume', expected_status=200)
        
        if success and isinstance(response, list):
            return self.log_test("Get Resumes", True, f"- Found {len(response)} resumes")
        else:
            return self.log_test("Get Resumes", False, f"- Status: {status}, Response: {response}")

    def test_create_prompt(self):
        """Test creating a custom prompt"""
        if not self.token:
            return self.log_test("Create Prompt", False, "- No token available")
        
        prompt_data = {
            "title": "Technical Interview Questions",
            "prompt_text": "Ask me about my experience with Python, React, and database design. Focus on practical examples and problem-solving approaches."
        }
        
        success, status, response = self.make_request('POST', 'prompts', prompt_data, expected_status=200)
        
        if success and 'id' in response:
            self.created_resources['prompts'].append(response['id'])
            return self.log_test("Create Prompt", True, f"- Prompt ID: {response['id']}")
        else:
            return self.log_test("Create Prompt", False, f"- Status: {status}, Response: {response}")

    def test_get_prompts(self):
        """Test getting user's prompts"""
        if not self.token:
            return self.log_test("Get Prompts", False, "- No token available")
        
        success, status, response = self.make_request('GET', 'prompts', expected_status=200)
        
        if success and isinstance(response, list):
            return self.log_test("Get Prompts", True, f"- Found {len(response)} prompts")
        else:
            return self.log_test("Get Prompts", False, f"- Status: {status}, Response: {response}")

    def test_update_prompt(self):
        """Test updating a prompt"""
        if not self.token or not self.created_resources['prompts']:
            return self.log_test("Update Prompt", False, "- No token or prompts available")
        
        prompt_id = self.created_resources['prompts'][0]
        update_data = {
            "title": "Updated Technical Interview Questions",
            "prompt_text": "Updated: Ask me about my experience with Python, React, and database design."
        }
        
        success, status, response = self.make_request('PUT', f'prompts/{prompt_id}', update_data, expected_status=200)
        
        if success and response.get('title') == update_data['title']:
            return self.log_test("Update Prompt", True, f"- Prompt updated successfully")
        else:
            return self.log_test("Update Prompt", False, f"- Status: {status}, Response: {response}")

    def test_create_application(self):
        """Test creating a job application"""
        if not self.token:
            return self.log_test("Create Application", False, "- No token available")
        
        app_data = {
            "company_name": "Tech Corp",
            "role": "Senior Software Engineer",
            "platform": "LinkedIn",
            "status": "Applied",
            "notes": "Applied through company website, waiting for response",
            "salary_range": "$120k - $150k"
        }
        
        success, status, response = self.make_request('POST', 'applications', app_data, expected_status=200)
        
        if success and 'id' in response:
            self.created_resources['applications'].append(response['id'])
            return self.log_test("Create Application", True, f"- Application ID: {response['id']}")
        else:
            return self.log_test("Create Application", False, f"- Status: {status}, Response: {response}")

    def test_get_applications(self):
        """Test getting user's applications"""
        if not self.token:
            return self.log_test("Get Applications", False, "- No token available")
        
        success, status, response = self.make_request('GET', 'applications', expected_status=200)
        
        if success and isinstance(response, list):
            return self.log_test("Get Applications", True, f"- Found {len(response)} applications")
        else:
            return self.log_test("Get Applications", False, f"- Status: {status}, Response: {response}")

    def test_update_application(self):
        """Test updating an application"""
        if not self.token or not self.created_resources['applications']:
            return self.log_test("Update Application", False, "- No token or applications available")
        
        app_id = self.created_resources['applications'][0]
        update_data = {
            "company_name": "Tech Corp",
            "role": "Senior Software Engineer",
            "platform": "LinkedIn",
            "status": "Interview",
            "notes": "First round interview scheduled for next week",
            "salary_range": "$120k - $150k"
        }
        
        success, status, response = self.make_request('PUT', f'applications/{app_id}', update_data, expected_status=200)
        
        if success and response.get('status') == 'Interview':
            return self.log_test("Update Application", True, f"- Status updated to Interview")
        else:
            return self.log_test("Update Application", False, f"- Status: {status}, Response: {response}")

    def test_dashboard_stats(self):
        """Test getting dashboard statistics"""
        if not self.token:
            return self.log_test("Dashboard Stats", False, "- No token available")
        
        success, status, response = self.make_request('GET', 'dashboard/stats', expected_status=200)
        
        if success and 'total_applications' in response:
            stats = f"Total: {response['total_applications']}, Interviews: {response['interviews']}, Offers: {response['offers']}"
            return self.log_test("Dashboard Stats", True, f"- {stats}")
        else:
            return self.log_test("Dashboard Stats", False, f"- Status: {status}, Response: {response}")

    def test_delete_resources(self):
        """Clean up created resources"""
        success_count = 0
        total_count = 0
        
        # Delete prompts
        for prompt_id in self.created_resources['prompts']:
            total_count += 1
            success, status, response = self.make_request('DELETE', f'prompts/{prompt_id}', expected_status=200)
            if success:
                success_count += 1
        
        # Delete applications
        for app_id in self.created_resources['applications']:
            total_count += 1
            success, status, response = self.make_request('DELETE', f'applications/{app_id}', expected_status=200)
            if success:
                success_count += 1
        
        return self.log_test("Delete Resources", success_count == total_count, f"- Deleted {success_count}/{total_count} resources")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Job Hunt Hub API Tests")
        print("=" * 50)
        
        # Authentication Tests
        print("\n📋 Authentication Tests:")
        self.test_auth_register()
        self.test_auth_me()
        
        # Resume Tests
        print("\n📄 Resume Tests:")
        self.test_resume_upload()
        self.test_get_resumes()
        
        # Custom Prompts Tests
        print("\n💬 Custom Prompts Tests:")
        self.test_create_prompt()
        self.test_get_prompts()
        self.test_update_prompt()
        
        # Job Applications Tests
        print("\n💼 Job Applications Tests:")
        self.test_create_application()
        self.test_get_applications()
        self.test_update_application()
        
        # Dashboard Tests
        print("\n📊 Dashboard Tests:")
        self.test_dashboard_stats()
        
        # Cleanup
        print("\n🧹 Cleanup Tests:")
        self.test_delete_resources()
        
        # Final Results
        print("\n" + "=" * 50)
        print(f"📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = JobHuntHubAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())