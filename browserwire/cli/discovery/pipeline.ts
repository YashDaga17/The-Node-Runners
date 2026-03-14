import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { SiteManifest } from '../../shared/types';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.BROWSERWIRE_LLM_API_KEY || '');

export async function discoverSite(url: string, screenshotBase64: string, domSnapshot: string): Promise<SiteManifest> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analyze the provided screenshot and DOM snapshot of the website: ${url}.
    Identify all interactive components (buttons, forms, links) and their purpose.
    Generate a typed API manifest in JSON format with the following structure:
    {
      "slug": "kebab-case-name",
      "url": "${url}",
      "version": "1.0.0",
      "entities": ["list of main data entities"],
      "actions": [
        {
          "name": "action_name",
          "description": "What it does",
          "parameters": {
            "type": "object",
            "properties": { ... JSON Schema ... }
          }
        }
      ]
    }
    Only return the JSON.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: screenshotBase64,
        mimeType: "image/png"
      }
    }
  ]);

  const response = await result.response;
  const text = response.text();
  
  // Clean up markdown if present
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse Gemini response as JSON');
  
  return JSON.parse(jsonMatch[0]) as SiteManifest;
}
