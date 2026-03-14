import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { SiteManifest } from '../shared/types';
import { discoverSite } from './discovery/pipeline';
import { manifestToOpenAPI } from './api/openapi';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.BROWSERWIRE_PORT || 8787;
const HOST = process.env.BROWSERWIRE_HOST || '127.0.0.1';

app.use(express.json());

// In-memory store for discovered sites (replace with DB for persistence)
const sites: Record<string, SiteManifest> = {};

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Landing page with site index
app.get('/api/docs', (req: Request, res: Response) => {
  const siteLinks = Object.values(sites).map(s => `<li><a href="/api/sites/${s.slug}/docs">${s.slug}</a> (${s.url})</li>`).join('');
  res.send(`
    <html>
      <head><title>BrowserWire - Discovered Sites</title></head>
      <body>
        <h1>BrowserWire API Index</h1>
        <ul>${siteLinks || '<li>No sites discovered yet. Start exploration from the Chrome extension.</li>'}</ul>
      </body>
    </html>
  `);
});

app.use('/api/sites/:slug/docs', (req: Request, res: Response, next: NextFunction) => {
  const slug = req.params.slug as string;
  const site = sites[slug];
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const openApi = manifestToOpenAPI(site);
  (swaggerUi.setup(openApi) as any)(req, res, next);
}, swaggerUi.serve);

// List sites
app.get('/api/sites', (req: Request, res: Response) => {
  res.json(Object.values(sites));
});

// OpenAPI spec
app.get('/api/sites/:slug/openapi.json', (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const site = sites[slug];
  if (!site) return res.status(404).json({ error: 'Site not found' });
  res.json(manifestToOpenAPI(site));
});

// WebSocket for extension communication
wss.on('connection', (ws: WebSocket) => {
  console.log('Extension connected');

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log('Received from extension:', data.type);
      
      if (data.type === 'PAGE_CAPTURE') {
        console.log('Processing discovery for:', data.url);
        try {
          const manifest = await discoverSite(data.url, data.screenshot, data.dom);
          sites[manifest.slug] = manifest;
          
          ws.send(JSON.stringify({
            type: 'MANIFEST_READY',
            manifest
          }));
        } catch (error) {
          console.error('Discovery failed:', error);
        }
      }
    } catch (e) {
      console.error('Failed to parse message', e);
    }
  });

  ws.on('close', () => {
    console.log('Extension disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`BrowserWire server listening on http://${HOST}:${PORT}`);
  console.log(`API Docs at http://${HOST}:${PORT}/api/docs`);
});
