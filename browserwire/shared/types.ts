export interface ActionSchema {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema
}

export interface SiteManifest {
  slug: string;
  url: string;
  version: string;
  entities: string[];
  actions: ActionSchema[];
}

export interface DiscoverySession {
  id: string;
  url: string;
  status: 'active' | 'completed';
  manifest?: SiteManifest;
}
