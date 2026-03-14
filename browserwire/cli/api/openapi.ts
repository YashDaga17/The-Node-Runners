import { SiteManifest, ActionSchema } from '../../shared/types';

export function manifestToOpenAPI(manifest: SiteManifest) {
  const paths: Record<string, any> = {};

  manifest.actions.forEach((action: ActionSchema) => {
    paths[`/api/sites/${manifest.slug}/workflows/${action.name}`] = {
      post: {
        summary: action.description,
        operationId: action.name,
        requestBody: {
          content: {
            'application/json': {
              schema: action.parameters
            }
          }
        },
        responses: {
          200: {
            description: 'Action executed successfully',
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          }
        }
      }
    };
  });

  return {
    openapi: '3.0.0',
    info: {
      title: `BrowserWire API - ${manifest.slug}`,
      version: manifest.version
    },
    paths
  };
}
