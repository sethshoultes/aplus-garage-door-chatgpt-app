import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

// Load service areas data
const serviceAreasData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'service-areas-data.json'), 'utf-8')
);

// Tool definitions for MCP ListTools
const toolDefinitions = [
  {
    name: "check_service_area",
    description: "Check if A Plus Garage Door services a specific location. ONLY use this tool when the user has explicitly stated their city, neighborhood, or zip code. Do NOT call this tool if you don't know the user's location - ask them first.",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city name, neighborhood, or zip code the user explicitly mentioned (e.g., 'Henderson', 'Las Vegas', 'Salt Lake City', '89123')"
        }
      },
      required: ["location"]
    },
    _meta: {
      "openai/outputTemplate": "https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/service-area-result.html",
      "openai/widgetAccessible": true
    }
  },
  {
    name: "diagnose_issue",
    description: "Diagnose garage door problems from symptoms the user described. Use this AFTER asking about their location and verifying service area coverage. Provides urgency level, likely issues, cost estimates, and safety warnings.",
    inputSchema: {
      type: "object",
      properties: {
        symptoms: {
          type: "array",
          items: { type: "string" },
          description: "List of symptoms the user described (e.g., ['won't close', 'grinding noise', 'stuck'])"
        }
      },
      required: ["symptoms"]
    },
    _meta: {
      "openai/outputTemplate": "https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/diagnosis-result.html",
      "openai/widgetAccessible": true
    }
  },
  {
    name: "create_service_request",
    description: "Book a garage door service appointment. Use when user wants to schedule service.",
    inputSchema: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          enum: ["emergency_repair", "standard_repair", "installation", "maintenance"]
        },
        issue_summary: { type: "string" },
        customer_name: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" }
      },
      required: ["service_type", "issue_summary", "customer_name", "phone", "address"]
    },
    _meta: {
      "openai/outputTemplate": "https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/booking-confirmation.html",
      "openai/widgetAccessible": true
    }
  }
];

// Service Area Tool Implementation
function checkServiceArea(location: string) {
  const searchTerm = location.toLowerCase().trim();

  // Validate location is provided
  if (!searchTerm || searchTerm.length < 2) {
    return {
      location: location || "unknown",
      is_covered: false,
      service_area_name: null,
      state: null,
      phone: null,
      nearest_coverage: null,
      distance_miles: 0,
      emergency_available: false,
      map_center: null,
      error: "Location not provided. Please ask the user for their city or zip code."
    };
  }

  // Check Nevada areas
  const nevadaAreas = serviceAreasData.regions.nevada.areas;
  for (const area of nevadaAreas) {
    if (area.name.toLowerCase() === searchTerm) {
      return {
        location,
        is_covered: true,
        service_area_name: area.name,
        state: "Nevada",
        phone: serviceAreasData.coverage_notes.phone_nevada,
        nearest_coverage: null,
        distance_miles: 0,
        emergency_available: true,
        map_center: area.coords,
      };
    }
    for (const prefix of area.zip_prefixes) {
      if (searchTerm.startsWith(prefix)) {
        return {
          location,
          is_covered: true,
          service_area_name: area.name,
          state: "Nevada",
          phone: serviceAreasData.coverage_notes.phone_nevada,
          nearest_coverage: null,
          distance_miles: 0,
          emergency_available: true,
          map_center: area.coords,
        };
      }
    }
  }

  // Check Utah areas
  const utahRegions = serviceAreasData.regions.utah.regions;
  for (const regionData of Object.values(utahRegions)) {
    const areas = (regionData as any).areas;
    for (const area of areas) {
      if (area.name.toLowerCase() === searchTerm) {
        return {
          location,
          is_covered: true,
          service_area_name: area.name,
          state: "Utah",
          phone: serviceAreasData.coverage_notes.phone_utah,
          nearest_coverage: null,
          distance_miles: 0,
          emergency_available: true,
          map_center: area.coords,
        };
      }
      for (const prefix of area.zip_prefixes) {
        if (searchTerm.startsWith(prefix)) {
          return {
            location,
            is_covered: true,
            service_area_name: area.name,
            state: "Utah",
            phone: serviceAreasData.coverage_notes.phone_utah,
            nearest_coverage: null,
            distance_miles: 0,
            emergency_available: true,
            map_center: area.coords,
        };
        }
      }
    }
  }

  return {
    location,
    is_covered: false,
    service_area_name: null,
    state: null,
    phone: serviceAreasData.coverage_notes.phone_nevada,
    nearest_coverage: "Las Vegas or Salt Lake City",
    distance_miles: 0,
    emergency_available: true,
    map_center: null,
  };
}

// Diagnose Issue Tool Implementation
function diagnoseIssue(symptoms: string[]) {
  const symptomsLower = symptoms.map(s => s.toLowerCase());

  let urgency = 'routine';
  const likelyIssues = [];
  let safetyWarning = null;
  let estimatedCost = { min: 100, max: 300 };

  if (symptomsLower.some(s => s.includes('won\'t close') || s.includes('stuck open'))) {
    urgency = 'emergency';
    safetyWarning = "DO NOT leave your garage open. This is a security risk.";
    likelyIssues.push({
      name: "Broken Spring",
      description: "The most common cause when a door won't close"
    });
    estimatedCost = { min: 150, max: 350 };
  } else if (symptomsLower.some(s => s.includes('loud') || s.includes('grinding') || s.includes('noise'))) {
    urgency = 'soon';
    likelyIssues.push({
      name: "Worn Rollers or Hinges",
      description: "Grinding or squeaking indicates worn parts"
    });
    estimatedCost = { min: 100, max: 250 };
  } else if (symptomsLower.some(s => s.includes('slow') || s.includes('jerky'))) {
    urgency = 'routine';
    likelyIssues.push({
      name: "Opener Motor Issue",
      description: "May need lubrication or motor replacement"
    });
    estimatedCost = { min: 100, max: 400 };
  } else {
    likelyIssues.push({
      name: "General Inspection Needed",
      description: "We'll diagnose during service visit"
    });
  }

  return {
    symptoms,
    urgency,
    likely_issues: likelyIssues,
    safety_warning: safetyWarning,
    estimated_cost_range: estimatedCost,
    applicable_promotion: urgency === 'emergency' ? null : "Spring Special: $75 OFF",
    next_steps: urgency === 'emergency' ?
      "Call immediately for emergency service" :
      "Schedule service at your convenience"
  };
}

// Create Service Request Tool Implementation
function createServiceRequest(params: any) {
  const confirmationNumber = `APG-${Date.now().toString().slice(-6)}`;

  return {
    confirmation_number: confirmationNumber,
    service_type: params.service_type,
    time_window: params.service_type === 'emergency_repair' ? 'Next available (1-2 hours)' : 'Tomorrow 9AM-12PM',
    customer_name: params.customer_name || params.name,
    contact_phone: params.phone,
    address: params.address,
    issue_summary: params.issue_summary,
    promotion_applied: params.service_type !== 'emergency_repair' ? {
      discount: "$30 OFF Spring Repair",
      code: "SPRING30"
    } : null,
    status: "confirmed",
    next_steps: "You'll receive a text when your technician is on the way"
  };
}

// MCP Protocol Handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      name: "A Plus Garage Door MCP Server",
      version: "1.0.0",
      protocol: "MCP (Model Context Protocol)",
      usage: 'POST with {"method": "tools/list"} or {"method": "tools/call", "params": {...}}',
      tools: ["check_service_area", "diagnose_issue", "create_service_request"]
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { jsonrpc, method, params, id } = req.body;

    // Validate JSON-RPC 2.0 format
    if (jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request - must use JSON-RPC 2.0'
        },
        id: id || null
      });
    }

    // Handle MCP protocol methods

    // Initialize method - required for MCP connection setup
    if (method === 'initialize') {
      return res.status(200).json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2025-03-26',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'A Plus Garage Door MCP Server',
            version: '1.0.0'
          }
        },
        id
      });
    }

    // Handle initialized notification (sent after initialize completes)
    if (method === 'notifications/initialized') {
      // This is a notification - no response required, but return 202 Accepted
      return res.status(202).end();
    }

    // Resources list - register widget templates
    if (method === 'resources/list') {
      return res.status(200).json({
        jsonrpc: '2.0',
        result: {
          resources: [
            {
              uri: 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/service-area-result.html',
              name: 'Service Area Result Widget',
              mimeType: 'text/html+skybridge'
            },
            {
              uri: 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/diagnosis-result.html',
              name: 'Diagnosis Result Widget',
              mimeType: 'text/html+skybridge'
            },
            {
              uri: 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/booking-confirmation.html',
              name: 'Booking Confirmation Widget',
              mimeType: 'text/html+skybridge'
            }
          ]
        },
        id
      });
    }

    // Resources read - fetch widget HTML content
    if (method === 'resources/read') {
      const uri = params?.uri;

      if (!uri) {
        return res.status(200).json({
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: 'Invalid params: uri required'
          },
          id
        });
      }

      // Proxy the widget HTML from Vercel
      try {
        const widgetResponse = await fetch(uri);
        const widgetHtml = await widgetResponse.text();

        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            contents: [
              {
                uri: uri,
                mimeType: 'text/html',
                text: widgetHtml
              }
            ]
          },
          id
        });
      } catch (error: any) {
        return res.status(200).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: `Failed to fetch widget: ${error.message}`
          },
          id
        });
      }
    }

    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: '2.0',
        result: {
          tools: toolDefinitions
        },
        id
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;

      let result;
      let widgetUrl;

      switch (name) {
        case 'check_service_area':
          result = checkServiceArea(toolArgs.location);
          widgetUrl = 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/service-area-result.html';
          break;
        case 'diagnose_issue':
          result = diagnoseIssue(toolArgs.symptoms);
          widgetUrl = 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/diagnosis-result.html';
          break;
        case 'create_service_request':
          result = createServiceRequest(toolArgs);
          widgetUrl = 'https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets/booking-confirmation.html';
          break;
        default:
          return res.status(200).json({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Tool '${name}' not found`
            },
            id
          });
      }

      // Fetch the widget HTML and inject the data
      try {
        const widgetResponse = await fetch(widgetUrl);
        let widgetHtml = await widgetResponse.text();

        // Inject the data directly into the HTML
        widgetHtml = widgetHtml.replace(
          '</head>',
          `<script>window.__TOOL_OUTPUT__ = ${JSON.stringify(result)};</script></head>`
        );

        // Also remove the non-existent bridge.js script
        widgetHtml = widgetHtml.replace(
          '<script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>',
          ''
        );

        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: "text",
                text: `Tool ${name} executed successfully`
              },
              {
                type: "resource",
                resource: {
                  uri: widgetUrl,
                  mimeType: "text/html",
                  text: widgetHtml
                }
              }
            ]
          },
          id
        });
      } catch (error: any) {
        return res.status(200).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: `Failed to render widget: ${error.message}`
          },
          id
        });
      }
    }

    // Unknown method error
    return res.status(200).json({
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: `Method '${method}' not found`
      },
      id
    });

  } catch (error: any) {
    console.error('MCP server error:', error);
    res.status(200).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      },
      id: req.body?.id || null
    });
  }
}
