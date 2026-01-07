// Simple dev server for local testing with ngrok
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json());

// Load service areas data
const serviceAreasData = JSON.parse(
  fs.readFileSync(join(__dirname, 'service-areas-data.json'), 'utf-8')
);

// Serve static widgets
app.use('/dist/widgets', express.static(join(__dirname, 'dist/widgets')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    tools: ["check_service_area", "diagnose_issue", "create_service_request"],
    mcp_endpoint: "/api/mcp",
    timestamp: new Date().toISOString()
  });
});

// MCP endpoint (JSON-RPC 2.0 compliant)
app.post('/api/mcp', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  // Validate JSON-RPC 2.0 format
  if (jsonrpc !== '2.0') {
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request - must use JSON-RPC 2.0'
      },
      id: id || null
    });
  }

  // Initialize method - required for MCP connection setup
  if (method === 'initialize') {
    return res.json({
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
    // This is a notification - no response required
    return res.status(202).end();
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      result: {
        tools: [
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
            }
          }
        ]
      },
      id
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params;

    let result;
    switch (name) {
      case 'check_service_area':
        result = checkServiceArea(toolArgs.location);
        break;
      case 'diagnose_issue':
        result = diagnoseIssue(toolArgs.symptoms);
        break;
      case 'create_service_request':
        result = createServiceRequest(toolArgs);
        break;
      default:
        return res.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Tool '${name}' not found`
          },
          id
        });
    }

    return res.json({
      jsonrpc: '2.0',
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result)
          }
        ]
      },
      id
    });
  }

  // Unknown method
  res.json({
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: `Method '${method}' not found`
    },
    id
  });
});

function checkServiceArea(location) {
  const searchTerm = location.toLowerCase().trim();

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
    const areas = regionData.areas;
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

function diagnoseIssue(symptoms) {
  const symptomsLower = symptoms.map(s => s.toLowerCase());

  let urgency = 'routine';
  const likelyIssues = [];
  let safetyWarning = null;
  let estimatedCost = { min: 100, max: 300 };

  if (symptomsLower.some(s => s.includes("won't close") || s.includes('stuck open'))) {
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

function createServiceRequest(params) {
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

app.listen(PORT, () => {
  console.log(`\n🚀 Local MCP server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   MCP: http://localhost:${PORT}/api/mcp`);
  console.log(`   Widgets: http://localhost:${PORT}/dist/widgets/\n`);
  console.log(`📡 Ready for ngrok tunnel!\n`);
});
