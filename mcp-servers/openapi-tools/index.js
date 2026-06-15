#!/usr/bin/env node
/**
 * openapi-tools MCP server
 *
 * Exposes tools for the `api-test-planner` and `api-test-generator` agents.
 *
 * Tools:
 *  - load_openapi_spec(source)            -> spec summary + counts
 *  - list_endpoints()                     -> list of {method, path, operationId, tags, summary}
 *  - get_endpoint_schema(method, path)    -> resolved params/requestBody/responses schemas
 *  - get_spec_info()                      -> info, servers, security schemes
 *  - save_test_plan(filename, plan)       -> writes JSON plan to specs/api/
 *  - write_api_test(filename, content)    -> writes generated .spec.ts to tests/api/
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SPECS_API_DIR = path.join(REPO_ROOT, 'specs', 'api');
const TESTS_API_DIR = path.join(REPO_ROOT, 'tests', 'api');

/** @type {any} */
let dereferencedSpec = null;
let rawSource = null;

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

function ensureSpecLoaded() {
  if (!dereferencedSpec) {
    throw new Error(
      'No spec loaded yet. Call load_openapi_spec with a file path or URL first.'
    );
  }
}

function buildEndpointList(spec) {
  const endpoints = [];
  const paths = spec.paths || {};
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;
      endpoints.push({
        method: method.toUpperCase(),
        path: pathKey,
        operationId: op.operationId || null,
        tags: op.tags || [],
        summary: op.summary || op.description || null,
        deprecated: !!op.deprecated,
      });
    }
  }
  return endpoints;
}

function findOperation(spec, method, path) {
  const pathItem = spec.paths?.[path];
  if (!pathItem) {
    throw new Error(`Path not found in spec: ${path}`);
  }
  const op = pathItem[method.toLowerCase()];
  if (!op) {
    throw new Error(`Method ${method.toUpperCase()} not found for path ${path}`);
  }
  return { pathItem, op };
}

function summarizeResponses(op) {
  const responses = op.responses || {};
  const summary = {};
  for (const [status, resp] of Object.entries(responses)) {
    const content = resp.content || {};
    const contentTypes = Object.keys(content);
    summary[status] = {
      description: resp.description || null,
      contentTypes,
      schema: contentTypes.length
        ? content[contentTypes[0]].schema || null
        : null,
    };
  }
  return summary;
}

function summarizeRequestBody(op) {
  if (!op.requestBody) return null;
  const content = op.requestBody.content || {};
  const contentTypes = Object.keys(content);
  if (!contentTypes.length) return null;
  const primary = contentTypes[0];
  return {
    required: !!op.requestBody.required,
    contentType: primary,
    schema: content[primary].schema || null,
  };
}

function summarizeParameters(pathItem, op) {
  const all = [...(pathItem.parameters || []), ...(op.parameters || [])];
  return all.map((p) => ({
    name: p.name,
    in: p.in,
    required: !!p.required,
    description: p.description || null,
    schema: p.schema || null,
  }));
}

const server = new Server(
  { name: 'openapi-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'load_openapi_spec',
      description:
        'Load and fully dereference a Swagger 2.0 / OpenAPI 3.x document from a local file path or URL. Must be called before any other tool.',
      inputSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description:
              'Path (relative to repo root, e.g. "api-specs/petstore.openapi.json") or URL to the swagger/openapi document.',
          },
        },
        required: ['source'],
      },
    },
    {
      name: 'get_spec_info',
      description:
        "Return the loaded spec's info block (title, version, description), servers/base URLs, and security schemes.",
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'list_endpoints',
      description:
        'List every endpoint (method + path) in the loaded spec with operationId, tags, and summary. Use this to plan coverage before drilling into individual endpoint schemas.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'save_test_plan',
      description:
        'Save a structured JSON API test plan to specs/api/<filename>.json (relative to repo root). Overwrites if the file already exists. Pretty-prints with 2-space indentation.',
      inputSchema: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description:
              'Output filename, e.g. "users.api-plan.json". Will be written under specs/api/.',
          },
          plan: {
            description:
              'The test plan JSON. Either a single object {feature, endpoint, method, testCases} or an array of such objects (one per endpoint).',
          },
        },
        required: ['filename', 'plan'],
      },
    },
    {
      name: 'write_api_test',
      description:
        'Write a generated Playwright API test spec file to tests/api/<filename> (relative to repo root). ' +
        'Creates tests/api/ if missing and overwrites the file if it already exists. ' +
        'Use this to save the generated .spec.ts content to disk — do not print code to chat.',
      inputSchema: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description:
              'Output filename only, e.g. "pet.api.spec.ts". Will be written under tests/api/. Must end in .ts or .tsx.',
          },
          content: {
            type: 'string',
            description: 'Full TypeScript file contents to write verbatim.',
          },
        },
        required: ['filename', 'content'],
      },
    },
    {
      name: 'get_endpoint_schema',
      description:
        'Get fully-resolved (de-$ref-ed) parameters, request body schema, and response schemas for a single endpoint.',
      inputSchema: {
        type: 'object',
        properties: {
          method: {
            type: 'string',
            description: 'HTTP method, e.g. GET, POST, PUT, DELETE, PATCH',
          },
          path: {
            type: 'string',
            description: 'The exact path key as it appears in the spec, e.g. "/pets/{id}"',
          },
        },
        required: ['method', 'path'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'load_openapi_spec': {
        const { source } = args;
        const spec = await SwaggerParser.validate(source);
        dereferencedSpec = spec;
        rawSource = source;

        const endpointCount = buildEndpointList(spec).length;
        const result = {
          source,
          title: spec.info?.title || null,
          version: spec.info?.version || null,
          openapiVersion: spec.openapi || spec.swagger || null,
          pathCount: Object.keys(spec.paths || {}).length,
          endpointCount,
          tags: (spec.tags || []).map((t) => t.name),
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_spec_info': {
        ensureSpecLoaded();
        const spec = dereferencedSpec;
        const result = {
          source: rawSource,
          info: spec.info || null,
          servers:
            spec.servers ||
            (spec.host
              ? [{ url: `${spec.schemes?.[0] || 'https'}://${spec.host}${spec.basePath || ''}` }]
              : []),
          securitySchemes:
            spec.components?.securitySchemes || spec.securityDefinitions || {},
          globalSecurity: spec.security || [],
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'list_endpoints': {
        ensureSpecLoaded();
        const endpoints = buildEndpointList(dereferencedSpec);
        return {
          content: [{ type: 'text', text: JSON.stringify(endpoints, null, 2) }],
        };
      }

      case 'save_test_plan': {
        const { filename, plan } = args;

        if (!filename || typeof filename !== 'string') {
          throw new Error('filename is required and must be a string');
        }
        const safeName = path.basename(filename);
        if (safeName !== filename) {
          throw new Error('filename must not contain path separators');
        }
        if (!/\.json$/i.test(safeName)) {
          throw new Error('filename must end with .json');
        }

        fs.mkdirSync(SPECS_API_DIR, { recursive: true });
        const outPath = path.join(SPECS_API_DIR, safeName);
        fs.writeFileSync(outPath, JSON.stringify(plan, null, 2) + '\n', 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { saved: true, path: path.relative(REPO_ROOT, outPath) },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'write_api_test': {
        const { filename, content } = args;

        if (!filename || typeof filename !== 'string') {
          throw new Error('filename is required and must be a string');
        }
        const safeName = path.basename(filename);
        if (safeName !== filename) {
          throw new Error('filename must not contain path separators');
        }
        if (!/\.(ts|tsx)$/i.test(safeName)) {
          throw new Error('filename must end with .ts or .tsx');
        }
        if (typeof content !== 'string') {
          throw new Error('content is required and must be a string');
        }

        fs.mkdirSync(TESTS_API_DIR, { recursive: true });
        const outPath = path.join(TESTS_API_DIR, safeName);
        fs.writeFileSync(outPath, content, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { saved: true, path: path.relative(REPO_ROOT, outPath) },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_endpoint_schema': {
        ensureSpecLoaded();
        const { method, path: opPath } = args;
        const { pathItem, op } = findOperation(dereferencedSpec, method, opPath);

        const result = {
          method: method.toUpperCase(),
          path: opPath,
          operationId: op.operationId || null,
          summary: op.summary || null,
          description: op.description || null,
          tags: op.tags || [],
          parameters: summarizeParameters(pathItem, op),
          requestBody: summarizeRequestBody(op),
          responses: summarizeResponses(op),
          security: op.security || dereferencedSpec.security || [],
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);