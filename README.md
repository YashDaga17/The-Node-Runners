# Job Search API with Crustdata

Backend API for searching recent job openings using Crustdata Web Search API.

## Setup

1. Install uv (if not already installed):
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with Homebrew
brew install uv
```

2. Install dependencies:
```bash
uv pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your Crustdata API key to `.env`:
```
CRUSTDATA_API_KEY=your_actual_api_key
```

## Run

```bash
uv run uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

## Usage

### Search for jobs

```bash
curl -X POST http://localhost:8000/api/search-jobs -H "Content-Type: application/json" -d '{"role": "software engineer", "location": "US", "fetch_content": false}'
```

### With full content

```bash
curl -X POST http://localhost:8000/api/search-jobs -H "Content-Type: application/json" -d '{"role": "data scientist", "location": "GB", "fetch_content": true}'
```

### Test with Python script

```bash
uv run python test_api.py
```

## API Docs

Interactive docs at `http://localhost:8000/docs`
