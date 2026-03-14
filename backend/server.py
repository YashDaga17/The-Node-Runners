from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import io
from PyPDF2 import PdfReader
from docx import Document
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== MODELS ==========

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class ResumeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    filename: str
    parsed_data: Optional[Dict[str, Any]] = None
    uploaded_at: str

class CustomPrompt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    prompt_text: str
    created_at: str

class CustomPromptCreate(BaseModel):
    title: str
    prompt_text: str

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    company_name: str
    role: str
    platform: str
    status: str
    applied_date: str
    notes: Optional[str] = None
    salary_range: Optional[str] = None

class JobApplicationCreate(BaseModel):
    company_name: str
    role: str
    platform: str
    status: str = "Applied"
    notes: Optional[str] = None
    salary_range: Optional[str] = None

class DashboardStats(BaseModel):
    total_applications: int
    interviews: int
    offers: int
    rejections: int
    pending: int
    total_spent: float
    applications_this_week: int
    top_platforms: List[Dict[str, Any]]
    recent_applications: List[JobApplication]

# ========== HELPER FUNCTIONS ==========

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    return jwt.encode(
        {'user_id': user_id, 'exp': expiration},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        raise Exception(f"PDF extraction failed: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    try:
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""

async def parse_resume_with_ai(text: str) -> Dict[str, Any]:
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise Exception("API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"resume-parse-{uuid.uuid4()}",
            system_message="You are an expert resume parser. Extract structured information from resumes and return it in JSON format."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Parse the following resume text and extract information into this JSON structure:
{{
  "personal_info": {{
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "location",
    "linkedin": "linkedin url",
    "portfolio": "portfolio url"
  }},
  "summary": "professional summary",
  "experience": [
    {{
      "company": "company name",
      "role": "job title",
      "duration": "time period",
      "description": "responsibilities and achievements"
    }}
  ],
  "education": [
    {{
      "institution": "school/university name",
      "degree": "degree name",
      "field": "field of study",
      "year": "graduation year"
    }}
  ],
  "skills": ["skill1", "skill2"],
  "certifications": ["certification1"],
  "projects": [
    {{
      "name": "project name",
      "description": "project description",
      "technologies": ["tech1", "tech2"]
    }}
  ]
}}

Resume text:
{text}

Return ONLY valid JSON, no markdown formatting or additional text."""
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Clean response
        response_text = response.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        import json
        parsed_data = json.loads(response_text.strip())
        return parsed_data
    except Exception as e:
        logger.error(f"Error parsing resume with AI: {e}")
        return {"error": str(e), "raw_text": text[:500]}

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ========== RESUME ENDPOINTS ==========

@api_router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        file_content = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        else:
            text = extract_text_from_docx(file_content)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Parse with AI
        parsed_data = await parse_resume_with_ai(text)
        
        # Save to database
        resume_id = str(uuid.uuid4())
        resume_doc = {
            "id": resume_id,
            "user_id": user_id,
            "filename": file.filename,
            "parsed_data": parsed_data,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.resumes.insert_one(resume_doc)
        
        return {
            "id": resume_id,
            "filename": file.filename,
            "parsed_data": parsed_data
        }
    except Exception as e:
        logger.error(f"Error uploading resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/resume", response_model=List[ResumeResponse])
async def get_resumes(user_id: str = Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return resumes

@api_router.get("/resume/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str, user_id: str = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": user_id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

# ========== CUSTOM PROMPTS ENDPOINTS ==========

@api_router.post("/prompts", response_model=CustomPrompt)
async def create_prompt(
    prompt_data: CustomPromptCreate,
    user_id: str = Depends(get_current_user)
):
    prompt_id = str(uuid.uuid4())
    prompt_doc = {
        "id": prompt_id,
        "user_id": user_id,
        "title": prompt_data.title,
        "prompt_text": prompt_data.prompt_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.prompts.insert_one(prompt_doc)
    return prompt_doc

@api_router.get("/prompts", response_model=List[CustomPrompt])
async def get_prompts(user_id: str = Depends(get_current_user)):
    prompts = await db.prompts.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return prompts

@api_router.put("/prompts/{prompt_id}", response_model=CustomPrompt)
async def update_prompt(
    prompt_id: str,
    prompt_data: CustomPromptCreate,
    user_id: str = Depends(get_current_user)
):
    result = await db.prompts.update_one(
        {"id": prompt_id, "user_id": user_id},
        {"$set": {"title": prompt_data.title, "prompt_text": prompt_data.prompt_text}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt = await db.prompts.find_one({"id": prompt_id}, {"_id": 0})
    return prompt

@api_router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, user_id: str = Depends(get_current_user)):
    result = await db.prompts.delete_one({"id": prompt_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return {"message": "Prompt deleted"}

# ========== JOB APPLICATIONS ENDPOINTS ==========

@api_router.post("/applications", response_model=JobApplication)
async def create_application(
    app_data: JobApplicationCreate,
    user_id: str = Depends(get_current_user)
):
    app_id = str(uuid.uuid4())
    app_doc = {
        "id": app_id,
        "user_id": user_id,
        "company_name": app_data.company_name,
        "role": app_data.role,
        "platform": app_data.platform,
        "status": app_data.status,
        "applied_date": datetime.now(timezone.utc).isoformat(),
        "notes": app_data.notes,
        "salary_range": app_data.salary_range
    }
    
    await db.applications.insert_one(app_doc)
    return app_doc

@api_router.get("/applications", response_model=List[JobApplication])
async def get_applications(user_id: str = Depends(get_current_user)):
    apps = await db.applications.find({"user_id": user_id}, {"_id": 0}).sort("applied_date", -1).to_list(1000)
    return apps

@api_router.put("/applications/{app_id}", response_model=JobApplication)
async def update_application(
    app_id: str,
    app_data: JobApplicationCreate,
    user_id: str = Depends(get_current_user)
):
    result = await db.applications.update_one(
        {"id": app_id, "user_id": user_id},
        {"$set": app_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    return app

@api_router.delete("/applications/{app_id}")
async def delete_application(app_id: str, user_id: str = Depends(get_current_user)):
    result = await db.applications.delete_one({"id": app_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}

# ========== DASHBOARD STATS ENDPOINT ==========

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    apps = await db.applications.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_applications = len(apps)
    interviews = len([a for a in apps if a['status'] == 'Interview'])
    offers = len([a for a in apps if a['status'] == 'Offer'])
    rejections = len([a for a in apps if a['status'] == 'Rejected'])
    pending = len([a for a in apps if a['status'] == 'Applied'])
    
    # Calculate applications this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    applications_this_week = len([
        a for a in apps 
        if datetime.fromisoformat(a['applied_date']) > week_ago
    ])
    
    # Platform statistics
    platform_counts = {}
    for app in apps:
        platform = app['platform']
        platform_counts[platform] = platform_counts.get(platform, 0) + 1
    
    top_platforms = [
        {"platform": platform, "count": count}
        for platform, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Recent applications (last 5)
    recent_apps = sorted(apps, key=lambda x: x['applied_date'], reverse=True)[:5]
    
    return {
        "total_applications": total_applications,
        "interviews": interviews,
        "offers": offers,
        "rejections": rejections,
        "pending": pending,
        "total_spent": 0.0,  # Mock data for now
        "applications_this_week": applications_this_week,
        "top_platforms": top_platforms,
        "recent_applications": recent_apps
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
