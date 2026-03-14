from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI(title="Job Search API (Mock)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    # Mock data for testing
    query = f"{request.role} job openings hiring"
    
    mock_jobs = [
        {
            "title": f"Senior {request.role.title()} - Remote",
            "url": "https://example.com/job1",
            "snippet": f"We're looking for an experienced {request.role} to join our team. Remote work available.",
            "domain": "example.com",
        },
        {
            "title": f"{request.role.title()} Position at TechCorp",
            "url": "https://techcorp.com/careers/123",
            "snippet": f"Join our engineering team as a {request.role}. Competitive salary and benefits.",
            "domain": "techcorp.com",
        },
        {
            "title": f"Junior {request.role.title()} Opportunity",
            "url": "https://startup.io/jobs/456",
            "snippet": f"Great opportunity for a {request.role} to grow with our fast-paced startup.",
            "domain": "startup.io",
        }
    ]
    
    if request.fetch_content:
        for job in mock_jobs:
            job["content"] = f"<html><body><h1>{job['title']}</h1><p>Full job description content here...</p></body></html>"
    
    return JobSearchResponse(
        query=query,
        total_results=len(mock_jobs),
        jobs=mock_jobs
    )


@app.get("/")
async def root():
    return {"message": "Job Search API (Mock) - Use POST /api/search-jobs"}