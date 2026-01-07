import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

// Load service areas data
const serviceAreasData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'service-areas-data.json'), 'utf-8')
);

// Service Area Tool
function checkServiceArea(location: string) {
  const searchTerm = location.toLowerCase().trim();

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

// Diagnose Issue Tool
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

// Create Service Request Tool
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
      info: 'Test tool endpoint for demo',
      usage: 'POST with {"tool": "tool_name", "params": {...}}',
      available_tools: ['check_service_area', 'diagnose_issue', 'create_service_request']
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { tool: toolName, params, location, symptoms, service_type, issue_summary, customer_name, phone, address } = req.body;

    if (!toolName) {
      res.status(400).json({ error: 'Missing tool name' });
      return;
    }

    let result;

    switch (toolName) {
      case 'check_service_area':
        // Accept either params.location or location directly
        const loc = params?.location || location;
        result = checkServiceArea(loc);
        break;
      case 'diagnose_issue':
        // Accept either params.symptoms or symptoms directly
        const symp = params?.symptoms || symptoms;
        result = diagnoseIssue(symp);
        break;
      case 'create_service_request':
        // Accept either params or direct fields
        const serviceParams = params || {
          service_type,
          issue_summary,
          customer_name,
          phone,
          address
        };
        result = createServiceRequest(serviceParams);
        break;
      default:
        res.status(404).json({ error: `Tool '${toolName}' not found` });
        return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Tool execution error:', error);
    res.status(500).json({
      error: 'Tool execution failed',
      message: error.message,
    });
  }
}
