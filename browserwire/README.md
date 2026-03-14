# BrowserWire 🌐

A contract layer between AI agents and websites. Point it at any site, explore, and get a versioned, typed API manifest — served as a REST API your agent already knows how to call.

## Prerequisites

- Node.js (v18+)
- Google Chrome
- Gemini API Key (already configured in `.env`)

## Getting Started

### 1. Start the CLI Server
Navigate to the project directory and run the server using `ts-node`:

```bash
cd browserwire
npx ts-node cli/server.ts
```

The server will start on `http://localhost:8787`.

### 2. Install the Chrome Extension
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top right.
3. Click **Load unpacked**.
4. Select the `browserwire/extension` folder from this project.

### 3. Discover a Site
1. Navigate to any website in Chrome (e.g., https://news.ycombinator.com).
2. Click the **BrowserWire** extension icon in your toolbar to open the sidepanel.
3. Click **Start Exploring**.
4. The extension will capture the page state and send it to the CLI.
5. Once processed, the manifest will appear in the sidepanel.

## Exploring the APIs

- **Site Index**: `http://localhost:8787/api/docs`
- **OpenAPI Spec**: `http://localhost:8787/api/sites/:slug/openapi.json`
- **Swagger UI**: `http://localhost:8787/api/sites/:slug/docs` (Replace `:slug` with the kebab-case name of the site, e.g., `news-ycombinator-com`).

## Project Structure

- `cli/`: Node.js server, discovery pipeline, and REST API.
- `extension/`: Chrome extension sidepanel, content script, and background worker.
- `shared/`: Shared TypeScript types and contract definitions.
- `tests/`: Integration tests.

## License
MIT
