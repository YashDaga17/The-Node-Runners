from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Job Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CRUSTDATA_API_KEY = os.getenv("CRUSTDATA_API_KEY")
CRUSTDATA_URL = "https://api.crustdata.com/screener/web-search"

# Debug: Print API key status (without exposing the key)
print(f"API Key loaded: {'Yes' if CRUSTDATA_API_KEY else 'No'}")
if CRUSTDATA_API_KEY:
    print(f"API Key length: {len(CRUSTDATA_API_KEY)}")
    print(f"API Key starts with: {CRUSTDATA_API_KEY[:8]}...")
else:
    print("❌ CRUSTDATA_API_KEY not found in environment")


class JobSearchRequest(BaseModel):
    role: str
    location: str = "US"
    fetch_content: bool = False


class JobSearchResponse(BaseModel):
    query: str
    total_results: int
    jobs: list


@app.post("/api/search-jobs", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    if not CRUSTDATA_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    # Build search query for job openings
    query = f"{request.role} job openings hiring"
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {CRUSTDATA_API_KEY}",
    }
    
    payload = {
        "query": query,
        "geolocation": request.location,
        "sources": ["web"],
    }
    
    # Add fetch_content as query param if requested
    params = {"fetch_content": "true"} if request.fetch_content else {}
    
    try:
        resp = requests.post(
            CRUSTDATA_URL,
            headers=headers,
            json=payload,
            params=params,
            timeout=60
        )
        
        # Log the response for debugging
        print(f"Response status: {resp.status_code}")
        print(f"Response headers: {dict(resp.headers)}")
        print(f"Response text: {resp.text[:500]}")
        
        resp.raise_for_status()
        data = resp.json()
        
        # Extract relevant job info
        jobs = []
        for result in data.get("results", []):
            job_info = {
                "title": result.get("title"),
                "url": result.get("url"),
                "snippet": result.get("snippet"),
                "domain": result.get("domain"),
            }
            if request.fetch_content and "contents" in result:
                job_info["content"] = result["contents"]
            jobs.append(job_info)
        
        return JobSearchResponse(
            query=query,
            total_results=len(jobs),
            jobs=jobs
        )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")


@app.get("/")
async def root():
    return {"message": "Job Search API - Use POST /api/search-jobs"}
