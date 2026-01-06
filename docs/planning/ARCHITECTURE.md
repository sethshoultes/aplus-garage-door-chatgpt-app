# A Plus Garage Door - ChatGPT Emergency Service App
## Technical Architecture Specification

---

## Overview

This ChatGPT app enables A Plus Garage Door customers to check service area coverage, diagnose common issues, view current promotions, and book emergency or standard service appointments—all within a ChatGPT conversation. The app integrates with ServiceTitan for scheduling and provides rich visual confirmations.

### Value Proposition (Know / Do / Show)

| Pillar | Capability |
|--------|------------|
| **Know** | Real-time service area coverage, technician availability, current promotions, common issue diagnosis |
| **Do** | Create service requests, schedule appointments, initiate click-to-call, apply promotional discounts |
| **Show** | Service area maps, appointment confirmations, promotion cards, diagnostic visual guides |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ChatGPT                                         │
│                                                                              │
│  User: "My garage door won't close, I'm in Henderson"                       │
│                         │                                                    │
│                         ▼                                                    │
│              ┌─────────────────────┐                                        │
│              │   Model decides to   │                                        │
│              │   invoke app tools   │                                        │
│              └──────────┬──────────┘                                        │
└─────────────────────────┼───────────────────────────────────────────────────┘
                          │ MCP Protocol (HTTPS)
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     A Plus MCP Server (Node.js)                              │
│                     https://app.aplusgaragedoor.com/mcp                      │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ check_      │  │ diagnose_   │  │ get_        │  │ create_     │        │
│  │ service_    │  │ issue       │  │ promotions  │  │ service_    │        │
│  │ area        │  │             │  │             │  │ request     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
         ┌─────────────────┐             ┌─────────────────┐
         │  ServiceTitan   │             │   Internal DB   │
         │  Scheduling API │             │  (Promotions,   │
         │                 │             │   Service Areas,│
         └─────────────────┘             │   Diagnostics)  │
                                         └─────────────────┘
```

---

## MCP Server Implementation

### Project Structure

```
aplus-chatgpt-app/
├── src/
│   ├── server.ts              # MCP server entry point
│   ├── tools/
│   │   ├── check-service-area.ts
│   │   ├── diagnose-issue.ts
│   │   ├── get-promotions.ts
│   │   ├── create-service-request.ts
│   │   ├── get-availability.ts
│   │   └── get-appointment-status.ts
│   ├── services/
│   │   ├── servicetitan.ts    # ServiceTitan API client
│   │   ├── promotions.ts      # Promotion logic
│   │   └── diagnostics.ts     # Issue diagnosis engine
│   ├── widgets/
│   │   ├── service-area-map.html
│   │   ├── appointment-confirmation.html
│   │   ├── promotion-card.html
│   │   ├── diagnosis-result.html
│   │   └── door-styles-carousel.html
│   └── data/
│       ├── service-areas.json
│       ├── promotions.json
│       └── diagnostic-tree.json
├── package.json
├── tsconfig.json
└── .env
```

### Dependencies

```json
{
  "name": "aplus-garage-door-chatgpt-app",
  "version": "1.0.0",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "zod": "^3.22.0",
    "express": "^4.18.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0"
  }
}
```

---

## Tool Definitions

### 1. check_service_area

Validates if user's location is within A Plus service coverage.

```typescript
// src/tools/check-service-area.ts
import { z } from "zod";

export const checkServiceAreaTool = {
  name: "check_service_area",
  metadata: {
    title: "Check Service Area",
    description: "Verify if a location is within A Plus Garage Door's Las Vegas Valley service area. Use when user mentions a city, neighborhood, or zip code in Nevada.",
    inputSchema: {
      location: z.string().describe("City name, neighborhood, or zip code (e.g., 'Henderson', 'Summerlin', '89123')"),
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/service-area-result.html",
      "openai/toolInvocation/invoking": "Checking service area coverage...",
      "openai/toolInvocation/invoked": "Service area verified"
    }
  },
  handler: async ({ location }: { location: string }) => {
    const coverage = await checkCoverage(location);
    
    return {
      structuredContent: {
        location: location,
        is_covered: coverage.isCovered,
        service_area_name: coverage.areaName,
        nearest_coverage: coverage.nearestArea,
        distance_miles: coverage.distance,
        phone: "(702) 297-7811",
        emergency_available: true,
        map_center: coverage.coordinates
      }
    };
  }
};

// Service area data
const SERVICE_AREAS = [
  { name: "Las Vegas", zip_prefixes: ["891"], coords: { lat: 36.1699, lng: -115.1398 } },
  { name: "Henderson", zip_prefixes: ["890"], coords: { lat: 36.0395, lng: -114.9817 } },
  { name: "North Las Vegas", zip_prefixes: ["890"], coords: { lat: 36.1989, lng: -115.1175 } },
  { name: "Summerlin", zip_prefixes: ["891"], coords: { lat: 36.1872, lng: -115.3640 } },
  { name: "Paradise", zip_prefixes: ["891"], coords: { lat: 36.0970, lng: -115.1346 } },
  { name: "Spring Valley", zip_prefixes: ["891"], coords: { lat: 36.1080, lng: -115.2450 } },
  { name: "Enterprise", zip_prefixes: ["891"], coords: { lat: 36.0267, lng: -115.2320 } },
  { name: "Boulder City", zip_prefixes: ["890"], coords: { lat: 35.9780, lng: -114.8322 } },
  { name: "Mesquite", zip_prefixes: ["890"], coords: { lat: 36.8055, lng: -114.0672 } },
  { name: "Sunrise Manor", zip_prefixes: ["891"], coords: { lat: 36.2110, lng: -115.0730 } },
  { name: "Whitney", zip_prefixes: ["890"], coords: { lat: 36.0350, lng: -115.0350 } }
];
```

---

### 2. diagnose_issue

Helps identify garage door problems based on symptoms.

```typescript
// src/tools/diagnose-issue.ts
import { z } from "zod";

export const diagnoseIssueTool = {
  name: "diagnose_issue",
  metadata: {
    title: "Diagnose Garage Door Issue",
    description: "Analyze garage door symptoms to identify likely problems and recommend appropriate service. Use when user describes door behavior, sounds, or malfunctions.",
    inputSchema: {
      symptoms: z.array(z.string()).describe("List of symptoms (e.g., ['loud grinding noise', 'door won't close fully', 'remote not working'])"),
      door_age_years: z.number().optional().describe("Approximate age of the garage door in years"),
      door_type: z.enum(["single", "double", "unknown"]).optional().describe("Type of garage door")
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/diagnosis-result.html",
      "openai/toolInvocation/invoking": "Analyzing symptoms...",
      "openai/toolInvocation/invoked": "Diagnosis complete"
    }
  },
  handler: async ({ symptoms, door_age_years, door_type }) => {
    const diagnosis = analyzeDiagnosis(symptoms, door_age_years);
    
    return {
      structuredContent: {
        likely_issues: diagnosis.issues,
        confidence: diagnosis.confidence,
        urgency: diagnosis.urgency, // "emergency" | "soon" | "routine"
        recommended_service: diagnosis.service,
        estimated_cost_range: diagnosis.costRange,
        applicable_promotion: diagnosis.promotion,
        safety_warning: diagnosis.safetyNote,
        next_steps: diagnosis.nextSteps
      }
    };
  }
};

// Diagnostic decision tree
const DIAGNOSTIC_TREE = {
  symptoms: {
    "won't open": {
      likely: ["broken_spring", "opener_failure", "power_issue"],
      urgency: "emergency",
      service: "repair"
    },
    "won't close": {
      likely: ["sensor_misalignment", "track_obstruction", "broken_spring"],
      urgency: "emergency", 
      service: "repair"
    },
    "loud grinding": {
      likely: ["worn_rollers", "track_damage", "lack_lubrication"],
      urgency: "soon",
      service: "maintenance"
    },
    "moves unevenly": {
      likely: ["broken_cable", "worn_rollers", "track_misalignment"],
      urgency: "soon",
      service: "repair"
    },
    "opens partially": {
      likely: ["broken_spring", "opener_limit_settings", "track_obstruction"],
      urgency: "emergency",
      service: "repair"
    },
    "makes banging noise": {
      likely: ["broken_spring", "loose_hardware", "worn_hinges"],
      urgency: "emergency",
      service: "repair"
    },
    "remote not working": {
      likely: ["dead_battery", "opener_failure", "signal_interference"],
      urgency: "routine",
      service: "repair"
    },
    "weather seal damaged": {
      likely: ["worn_seal", "rodent_damage"],
      urgency: "routine",
      service: "maintenance"
    }
  },
  
  issues: {
    broken_spring: {
      name: "Broken Spring",
      description: "Torsion or extension spring has snapped",
      cost_range: { min: 150, max: 350 },
      promotion: "spring_special",
      safety_note: "Do not attempt to operate door. Springs under extreme tension.",
      urgency: "emergency"
    },
    worn_rollers: {
      name: "Worn Rollers", 
      description: "Rollers are worn, cracked, or seized",
      cost_range: { min: 100, max: 200 },
      promotion: "tune_up",
      safety_note: null,
      urgency: "soon"
    },
    opener_failure: {
      name: "Opener Malfunction",
      description: "Garage door opener motor or circuit board issue",
      cost_range: { min: 150, max: 500 },
      promotion: "opener_special",
      safety_note: null,
      urgency: "soon"
    },
    broken_cable: {
      name: "Broken Cable",
      description: "Lift cable has frayed or snapped",
      cost_range: { min: 125, max: 250 },
      promotion: null,
      safety_note: "Door may fall unexpectedly. Do not use.",
      urgency: "emergency"
    },
    sensor_misalignment: {
      name: "Safety Sensor Issue",
      description: "Photo-eye sensors misaligned or malfunctioning",
      cost_range: { min: 75, max: 150 },
      promotion: "tune_up",
      safety_note: null,
      urgency: "soon"
    }
  }
};
```

---

### 3. get_promotions

Retrieves current deals and applicable discounts.

```typescript
// src/tools/get-promotions.ts
import { z } from "zod";

export const getPromotionsTool = {
  name: "get_promotions",
  metadata: {
    title: "Get Current Promotions",
    description: "Retrieve current A Plus Garage Door deals, coupons, and special offers. Use when user asks about pricing, discounts, or deals.",
    inputSchema: {
      service_type: z.enum(["repair", "installation", "maintenance", "all"]).optional()
        .describe("Filter promotions by service type"),
      issue_type: z.string().optional()
        .describe("Specific issue to find applicable promotions (e.g., 'spring', 'opener')")
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/promotions-carousel.html",
      "openai/toolInvocation/invoking": "Finding current deals...",
      "openai/toolInvocation/invoked": "Found available promotions"
    }
  },
  handler: async ({ service_type, issue_type }) => {
    const promos = getActivePromotions(service_type, issue_type);
    
    return {
      structuredContent: {
        promotions: promos,
        valid_until: "2025-10-31",
        disclaimer: "One coupon per visit. Valid Mon-Fri 8am-5pm. Not stackable.",
        phone: "(702) 297-7811"
      }
    };
  }
};

// Active promotions data
const PROMOTIONS = [
  {
    id: "spring_special",
    title: "Broken Spring Special",
    discount: "$75 OFF 2 Springs / $30 OFF 1",
    description: "Springs are your door's backbone—replace them now to keep it lifting smooth.",
    service_types: ["repair"],
    issue_types: ["broken_spring", "spring"],
    priority: 1
  },
  {
    id: "new_door",
    title: "New Door Savings",
    discount: "$200 OFF Any New Garage Door",
    description: "Steel, insulated, or custom. Boost curb appeal and recoup up to 194% at resale.",
    service_types: ["installation"],
    issue_types: [],
    priority: 2
  },
  {
    id: "tune_up",
    title: "Safety & Maintenance Deal",
    discount: "$49 (Reg. $89)",
    description: "Annual Lube & Tune with 24-Point Safety Inspection. Protect your investment in Vegas's heat!",
    service_types: ["maintenance"],
    issue_types: ["maintenance", "tune_up", "rollers", "lubrication"],
    priority: 3
  },
  {
    id: "opener_special",
    title: "Garage Motor Special", 
    discount: "$100 OFF LiftMaster Elite Series",
    description: "Smart features like MyQ app, 2,000-lumen LED, and ultra-quiet motor.",
    service_types: ["repair", "installation"],
    issue_types: ["opener", "motor", "remote"],
    priority: 4
  },
  {
    id: "winterization",
    title: "Winterization Special",
    discount: "50% OFF Rollers, Bottom Seals & Weather Trim",
    description: "Prepare your garage for the colder months.",
    service_types: ["maintenance"],
    issue_types: ["weather_seal", "rollers", "seal"],
    priority: 5
  },
  {
    id: "new_door_bundle",
    title: "New Door Upgrade Bundle",
    discount: "FREE Rollers + Lube & Tune ($287 Value)",
    description: "Purchase a new garage door motor with installation and get free rollers plus professional tune-up.",
    service_types: ["installation"],
    issue_types: ["opener", "motor"],
    priority: 6
  }
];
```

---

### 4. create_service_request

Books appointments via ServiceTitan integration.

```typescript
// src/tools/create-service-request.ts
import { z } from "zod";

export const createServiceRequestTool = {
  name: "create_service_request",
  metadata: {
    title: "Book Service Appointment",
    description: "Create a service request and schedule an appointment with A Plus Garage Door. Use when user wants to book repair, installation, or maintenance service.",
    inputSchema: {
      service_type: z.enum(["emergency_repair", "standard_repair", "installation", "maintenance"])
        .describe("Type of service requested"),
      issue_summary: z.string()
        .describe("Brief description of the issue or service needed"),
      customer_name: z.string()
        .describe("Customer's full name"),
      phone: z.string()
        .describe("Customer's phone number"),
      address: z.string()
        .describe("Service address including city and zip"),
      preferred_date: z.string().optional()
        .describe("Preferred appointment date (ISO format) - ignored for emergency"),
      preferred_time_window: z.enum(["morning", "afternoon", "evening", "asap"]).optional()
        .describe("Preferred time window"),
      promotion_code: z.string().optional()
        .describe("Promotion code to apply")
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/appointment-confirmation.html",
      "openai/toolInvocation/invoking": "Scheduling your appointment...",
      "openai/toolInvocation/invoked": "Appointment confirmed!",
      "openai/destructiveHint": false,
      "openai/confirmationRequired": true
    }
  },
  handler: async (args) => {
    // Integration with ServiceTitan API
    const booking = await createServiceTitanBooking(args);
    
    return {
      structuredContent: {
        confirmation_number: booking.confirmationId,
        status: "confirmed",
        service_type: args.service_type,
        scheduled_date: booking.scheduledDate,
        time_window: booking.timeWindow,
        estimated_arrival: booking.estimatedArrival,
        technician: booking.assignedTech,
        address: args.address,
        promotion_applied: args.promotion_code ? getPromotionDetails(args.promotion_code) : null,
        phone: "(702) 297-7811",
        can_modify: true,
        cancellation_policy: "Free cancellation up to 2 hours before appointment"
      }
    };
  }
};

// ServiceTitan API integration
async function createServiceTitanBooking(args: any) {
  const SERVICETITAN_API = process.env.SERVICETITAN_API_URL;
  const SERVICETITAN_KEY = process.env.SERVICETITAN_API_KEY;
  
  // Map service types to ServiceTitan job types
  const jobTypeMap = {
    emergency_repair: "EMERGENCY",
    standard_repair: "REPAIR", 
    installation: "INSTALL",
    maintenance: "MAINTENANCE"
  };
  
  const response = await axios.post(`${SERVICETITAN_API}/bookings`, {
    jobType: jobTypeMap[args.service_type],
    summary: args.issue_summary,
    customer: {
      name: args.customer_name,
      phone: args.phone,
      address: args.address
    },
    preferredDate: args.preferred_date,
    preferredWindow: args.preferred_time_window,
    source: "chatgpt_app",
    promotionCode: args.promotion_code
  }, {
    headers: {
      "Authorization": `Bearer ${SERVICETITAN_KEY}`,
      "Content-Type": "application/json"
    }
  });
  
  return response.data;
}
```

---

### 5. get_availability

Checks real-time technician availability.

```typescript
// src/tools/get-availability.ts
import { z } from "zod";

export const getAvailabilityTool = {
  name: "get_availability",
  metadata: {
    title: "Check Availability",
    description: "Check available appointment slots for A Plus Garage Door service. Use when user asks about scheduling or availability.",
    inputSchema: {
      service_type: z.enum(["emergency", "repair", "installation", "maintenance"])
        .describe("Type of service"),
      location: z.string()
        .describe("Service location (city or zip code)"),
      date_range_days: z.number().default(7)
        .describe("Number of days to check availability")
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/availability-slots.html",
      "openai/toolInvocation/invoking": "Checking technician availability...",
      "openai/toolInvocation/invoked": "Found available slots"
    }
  },
  handler: async ({ service_type, location, date_range_days }) => {
    const slots = await getServiceTitanAvailability(service_type, location, date_range_days);
    
    return {
      structuredContent: {
        service_type,
        location,
        emergency_available_now: service_type === "emergency",
        available_slots: slots,
        next_available: slots[0],
        phone: "(702) 297-7811",
        note: service_type === "emergency" 
          ? "24/7 emergency service available - call now for immediate dispatch"
          : null
      }
    };
  }
};
```

---

### 6. get_door_styles (for installation inquiries)

```typescript
// src/tools/get-door-styles.ts
import { z } from "zod";

export const getDoorStylesTool = {
  name: "get_door_styles",
  metadata: {
    title: "Browse Garage Door Styles",
    description: "Show available garage door styles for installation. Use when user asks about new door options, styles, or replacements.",
    inputSchema: {
      style_filter: z.enum(["steel", "aluminum", "insulated", "glass", "custom", "all"]).optional()
        .describe("Filter by door material/style"),
      budget_range: z.enum(["economy", "mid-range", "premium", "all"]).optional()
        .describe("Filter by price range")
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/door-styles-carousel.html",
      "openai/toolInvocation/invoking": "Loading door styles...",
      "openai/toolInvocation/invoked": "Here are your options"
    }
  },
  handler: async ({ style_filter, budget_range }) => {
    return {
      structuredContent: {
        styles: DOOR_STYLES.filter(s => 
          (!style_filter || style_filter === "all" || s.type === style_filter) &&
          (!budget_range || budget_range === "all" || s.budget === budget_range)
        ),
        promotion: {
          code: "new_door",
          discount: "$200 OFF",
          description: "Any new garage door installation"
        },
        consultation_available: true,
        financing_available: true
      }
    };
  }
};

const DOOR_STYLES = [
  {
    id: "steel_classic",
    name: "Classic Steel",
    type: "steel",
    budget: "economy",
    price_range: "$800 - $1,500",
    description: "Durable, low-maintenance steel doors in traditional raised panel design",
    features: ["Rust-resistant", "Multiple colors", "10-year warranty"],
    image_url: "/images/doors/steel-classic.jpg"
  },
  {
    id: "steel_carriage",
    name: "Carriage House Steel",
    type: "steel",
    budget: "mid-range",
    price_range: "$1,500 - $2,500",
    description: "Steel doors with carriage house styling for classic curb appeal",
    features: ["Decorative hardware", "Wood-look finish", "Insulation options"],
    image_url: "/images/doors/steel-carriage.jpg"
  },
  {
    id: "insulated_premium",
    name: "Premium Insulated",
    type: "insulated",
    budget: "mid-range",
    price_range: "$1,800 - $3,000",
    description: "Triple-layer insulated doors perfect for Vegas heat",
    features: ["R-16 insulation", "Energy efficient", "Quieter operation"],
    image_url: "/images/doors/insulated-premium.jpg"
  },
  {
    id: "aluminum_modern",
    name: "Modern Aluminum",
    type: "aluminum",
    budget: "premium",
    price_range: "$3,000 - $5,000",
    description: "Sleek, contemporary aluminum frames with glass panels",
    features: ["Full-view glass", "Powder-coated frames", "Modern aesthetic"],
    image_url: "/images/doors/aluminum-modern.jpg"
  },
  {
    id: "glass_full",
    name: "Full Glass",
    type: "glass",
    budget: "premium",
    price_range: "$4,000 - $7,000",
    description: "Maximum natural light with tempered glass panels",
    features: ["Tempered safety glass", "Frosted options", "Dramatic curb appeal"],
    image_url: "/images/doors/glass-full.jpg"
  },
  {
    id: "custom_design",
    name: "Custom Design",
    type: "custom",
    budget: "premium",
    price_range: "$5,000+",
    description: "Fully customized doors designed to your specifications",
    features: ["Unique designs", "Any material combination", "Architectural matching"],
    image_url: "/images/doors/custom.jpg"
  }
];
```

---

## Widget Implementations

### Service Area Result Widget (Inline Card)

```html
<!-- src/widgets/service-area-result.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="app" class="p-4 max-w-md">
    <!-- Loading state -->
    <div id="loading" class="animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    <!-- Content -->
    <div id="content" class="hidden">
      <!-- Covered -->
      <div id="covered" class="hidden">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-900">We service <span id="area-name"></span>!</p>
            <p class="text-sm text-gray-600">24/7 emergency service available</p>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-3 mb-3">
          <p class="text-sm text-gray-700">
            A Plus Garage Doors has been serving <span id="area-name-2"></span> for 19+ years with same-day service.
          </p>
        </div>
        
        <div class="flex gap-2">
          <button id="call-btn" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition">
            📞 Call Now
          </button>
          <button id="book-btn" class="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition">
            📅 Book Online
          </button>
        </div>
      </div>
      
      <!-- Not Covered -->
      <div id="not-covered" class="hidden">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-900">Outside service area</p>
            <p class="text-sm text-gray-600">Nearest coverage: <span id="nearest-area"></span></p>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-3">
          Call us to discuss options—we may still be able to help!
        </p>
        
        <button id="call-btn-alt" class="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition">
          📞 (702) 297-7811
        </button>
      </div>
    </div>
  </div>
  
  <script>
    const openai = window.openai;
    
    async function init() {
      const data = await openai.getToolOutput();
      
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('content').classList.remove('hidden');
      
      if (data.is_covered) {
        document.getElementById('covered').classList.remove('hidden');
        document.getElementById('area-name').textContent = data.service_area_name;
        document.getElementById('area-name-2').textContent = data.service_area_name;
        
        document.getElementById('call-btn').addEventListener('click', () => {
          openai.openUrl(`tel:${data.phone.replace(/[^0-9]/g, '')}`);
        });
        
        document.getElementById('book-btn').addEventListener('click', () => {
          openai.sendMessage("I'd like to book an appointment");
        });
      } else {
        document.getElementById('not-covered').classList.remove('hidden');
        document.getElementById('nearest-area').textContent = data.nearest_coverage;
        
        document.getElementById('call-btn-alt').addEventListener('click', () => {
          openai.openUrl(`tel:${data.phone.replace(/[^0-9]/g, '')}`);
        });
      }
    }
    
    init();
  </script>
</body>
</html>
```

---

### Diagnosis Result Widget (Inline Card)

```html
<!-- src/widgets/diagnosis-result.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <div id="app" class="p-4 max-w-md">
    <div id="content">
      <!-- Urgency Banner -->
      <div id="urgency-banner" class="rounded-lg p-3 mb-4">
        <div class="flex items-center gap-2">
          <span id="urgency-icon"></span>
          <span id="urgency-text" class="font-semibold"></span>
        </div>
      </div>
      
      <!-- Likely Issues -->
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-500 mb-2">LIKELY ISSUE</h3>
        <div id="issues-list"></div>
      </div>
      
      <!-- Safety Warning -->
      <div id="safety-warning" class="hidden bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div class="flex gap-2">
          <span class="text-red-600">⚠️</span>
          <p id="safety-text" class="text-sm text-red-800"></p>
        </div>
      </div>
      
      <!-- Estimated Cost -->
      <div class="bg-gray-50 rounded-lg p-3 mb-4">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Estimated cost range</span>
          <span id="cost-range" class="font-semibold text-gray-900"></span>
        </div>
        <div id="promo-line" class="hidden mt-2 pt-2 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm text-green-700">🏷️ <span id="promo-name"></span></span>
            <span id="promo-discount" class="font-semibold text-green-700"></span>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2">
        <button id="emergency-btn" class="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700">
          🚨 Emergency Service
        </button>
        <button id="schedule-btn" class="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800">
          📅 Schedule Repair
        </button>
      </div>
    </div>
  </div>
  
  <script>
    const openai = window.openai;
    
    async function init() {
      const data = await openai.getToolOutput();
      
      // Urgency styling
      const urgencyConfig = {
        emergency: { bg: 'bg-red-100', text: 'text-red-800', icon: '🚨', label: 'Emergency Service Recommended' },
        soon: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚡', label: 'Service Recommended Soon' },
        routine: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'ℹ️', label: 'Routine Service' }
      };
      
      const urgency = urgencyConfig[data.urgency];
      const banner = document.getElementById('urgency-banner');
      banner.classList.add(urgency.bg);
      document.getElementById('urgency-icon').textContent = urgency.icon;
      document.getElementById('urgency-text').textContent = urgency.label;
      document.getElementById('urgency-text').classList.add(urgency.text);
      
      // Issues list
      const issuesList = document.getElementById('issues-list');
      data.likely_issues.forEach((issue, i) => {
        const div = document.createElement('div');
        div.className = `p-3 bg-gray-50 rounded-lg ${i > 0 ? 'mt-2' : ''}`;
        div.innerHTML = `
          <p class="font-medium text-gray-900">${issue.name}</p>
          <p class="text-sm text-gray-600">${issue.description}</p>
        `;
        issuesList.appendChild(div);
      });
      
      // Safety warning
      if (data.safety_warning) {
        document.getElementById('safety-warning').classList.remove('hidden');
        document.getElementById('safety-text').textContent = data.safety_warning;
      }
      
      // Cost range
      document.getElementById('cost-range').textContent = 
        `$${data.estimated_cost_range.min} - $${data.estimated_cost_range.max}`;
      
      // Promotion
      if (data.applicable_promotion) {
        document.getElementById('promo-line').classList.remove('hidden');
        document.getElementById('promo-name').textContent = data.applicable_promotion.title;
        document.getElementById('promo-discount').textContent = data.applicable_promotion.discount;
      }
      
      // Button visibility based on urgency
      if (data.urgency !== 'emergency') {
        document.getElementById('emergency-btn').classList.add('hidden');
        document.getElementById('schedule-btn').classList.remove('flex-1');
        document.getElementById('schedule-btn').classList.add('w-full');
      }
      
      // Button actions
      document.getElementById('emergency-btn').addEventListener('click', () => {
        openai.sendMessage("I need emergency garage door service right now");
      });
      
      document.getElementById('schedule-btn').addEventListener('click', () => {
        openai.sendMessage("I'd like to schedule a repair appointment");
      });
    }
    
    init();
  </script>
</body>
</html>
```

---

### Appointment Confirmation Widget (Inline Card)

```html
<!-- src/widgets/appointment-confirmation.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <div id="app" class="p-4 max-w-md">
    <!-- Success Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-gray-900 text-lg">Appointment Confirmed!</p>
        <p class="text-sm text-gray-600">Confirmation #<span id="conf-number"></span></p>
      </div>
    </div>
    
    <!-- Appointment Details -->
    <div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-600">Service</span>
        <span id="service-type" class="font-medium text-gray-900"></span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Date</span>
        <span id="date" class="font-medium text-gray-900"></span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Time Window</span>
        <span id="time-window" class="font-medium text-gray-900"></span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Address</span>
        <span id="address" class="font-medium text-gray-900 text-right max-w-[60%]"></span>
      </div>
      <div id="tech-row" class="flex justify-between hidden">
        <span class="text-gray-600">Technician</span>
        <span id="technician" class="font-medium text-gray-900"></span>
      </div>
    </div>
    
    <!-- Promotion Applied -->
    <div id="promo-applied" class="hidden bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-green-600">🏷️</span>
        <div>
          <p class="text-sm font-medium text-green-800">Promotion Applied</p>
          <p id="promo-detail" class="text-sm text-green-700"></p>
        </div>
      </div>
    </div>
    
    <!-- What's Next -->
    <div class="bg-blue-50 rounded-lg p-3 mb-4">
      <p class="text-sm text-blue-800">
        <strong>What's next:</strong> You'll receive a text message when your technician is on the way with their photo and live ETA.
      </p>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <button id="modify-btn" class="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50">
        Modify
      </button>
      <button id="call-btn" class="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800">
        📞 Questions? Call
      </button>
    </div>
    
    <p class="text-xs text-gray-500 text-center mt-3">
      Free cancellation up to 2 hours before appointment
    </p>
  </div>
  
  <script>
    const openai = window.openai;
    
    async function init() {
      const data = await openai.getToolOutput();
      
      // Populate fields
      document.getElementById('conf-number').textContent = data.confirmation_number;
      
      const serviceLabels = {
        emergency_repair: 'Emergency Repair',
        standard_repair: 'Repair Service',
        installation: 'Installation',
        maintenance: 'Maintenance'
      };
      document.getElementById('service-type').textContent = serviceLabels[data.service_type];
      
      // Format date
      const date = new Date(data.scheduled_date);
      document.getElementById('date').textContent = date.toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
      });
      
      document.getElementById('time-window').textContent = data.time_window;
      document.getElementById('address').textContent = data.address;
      
      if (data.technician) {
        document.getElementById('tech-row').classList.remove('hidden');
        document.getElementById('technician').textContent = data.technician;
      }
      
      if (data.promotion_applied) {
        document.getElementById('promo-applied').classList.remove('hidden');
        document.getElementById('promo-detail').textContent = 
          `${data.promotion_applied.title}: ${data.promotion_applied.discount}`;
      }
      
      // Actions
      document.getElementById('modify-btn').addEventListener('click', () => {
        openai.sendMessage("I need to modify my appointment");
      });
      
      document.getElementById('call-btn').addEventListener('click', () => {
        openai.openUrl('tel:7022977811');
      });
    }
    
    init();
  </script>
</body>
</html>
```

---

### Door Styles Carousel Widget

```html
<!-- src/widgets/door-styles-carousel.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .carousel { 
      display: flex; 
      overflow-x: auto; 
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .carousel::-webkit-scrollbar { display: none; }
    .carousel-item { 
      scroll-snap-align: start; 
      flex-shrink: 0;
    }
  </style>
</head>
<body class="bg-white">
  <div id="app" class="py-4">
    <!-- Promo Banner -->
    <div id="promo-banner" class="mx-4 mb-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-3">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold">$200 OFF Any New Door</p>
          <p class="text-sm text-red-100">Professional installation included</p>
        </div>
        <span class="text-2xl">🏷️</span>
      </div>
    </div>
    
    <!-- Carousel -->
    <div id="carousel" class="carousel gap-4 px-4 pb-4">
      <!-- Items populated by JS -->
    </div>
    
    <!-- Actions -->
    <div class="px-4 pt-2 border-t border-gray-100">
      <div class="flex gap-2">
        <button id="consultation-btn" class="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium">
          📞 Free Consultation
        </button>
        <button id="financing-btn" class="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
          💳 Financing
        </button>
      </div>
    </div>
  </div>
  
  <script>
    const openai = window.openai;
    
    async function init() {
      const data = await openai.getToolOutput();
      const carousel = document.getElementById('carousel');
      
      data.styles.forEach(style => {
        const item = document.createElement('div');
        item.className = 'carousel-item w-64 bg-white rounded-xl border border-gray-200 overflow-hidden';
        item.innerHTML = `
          <div class="h-36 bg-gray-200 flex items-center justify-center">
            <span class="text-4xl">🚪</span>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-gray-900">${style.name}</h3>
              <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">${style.budget}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">${style.description}</p>
            <p class="font-medium text-gray-900">${style.price_range}</p>
            <div class="mt-2 flex flex-wrap gap-1">
              ${style.features.slice(0, 2).map(f => 
                `<span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">${f}</span>`
              ).join('')}
            </div>
          </div>
        `;
        
        item.addEventListener('click', () => {
          openai.sendMessage(`Tell me more about the ${style.name} garage door option`);
        });
        
        carousel.appendChild(item);
      });
      
      // Actions
      document.getElementById('consultation-btn').addEventListener('click', () => {
        openai.sendMessage("I'd like to schedule a free consultation for a new garage door");
      });
      
      document.getElementById('financing-btn').addEventListener('click', () => {
        openai.sendMessage("What financing options are available for a new garage door?");
      });
    }
    
    init();
  </script>
</body>
</html>
```

---

## MCP Server Entry Point

```typescript
// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { checkServiceAreaTool } from "./tools/check-service-area.js";
import { diagnoseIssueTool } from "./tools/diagnose-issue.js";
import { getPromotionsTool } from "./tools/get-promotions.js";
import { createServiceRequestTool } from "./tools/create-service-request.js";
import { getAvailabilityTool } from "./tools/get-availability.js";
import { getDoorStylesTool } from "./tools/get-door-styles.js";
import dotenv from "dotenv";

dotenv.config();

// Create MCP server
const server = new Server(
  {
    name: "aplus-garage-door",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register all tools
const tools = [
  checkServiceAreaTool,
  diagnoseIssueTool,
  getPromotionsTool,
  createServiceRequestTool,
  getAvailabilityTool,
  getDoorStylesTool
];

tools.forEach(tool => {
  server.setRequestHandler(/* tool registration logic */);
});

// Express server for HTTPS endpoint
const app = express();
app.use(express.json());

// Serve widgets
app.use("/widget", express.static("src/widgets"));

// MCP endpoint
app.post("/mcp", async (req, res) => {
  // Handle MCP protocol messages
  const response = await server.handleRequest(req.body);
  res.json(response);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`A Plus Garage Door MCP Server running on port ${PORT}`);
});
```

---

## Environment Configuration

```bash
# .env
SERVICETITAN_API_URL=https://api.servicetitan.io/v2
SERVICETITAN_API_KEY=your_api_key_here
SERVICETITAN_TENANT_ID=your_tenant_id

PORT=3000
NODE_ENV=production

# For local development with ngrok
# NGROK_AUTHTOKEN=your_ngrok_token
```

---

## User Flow Examples

### Flow 1: Emergency Service Request

```
User: "My garage door won't close and I'm stuck in Henderson"

ChatGPT: [Invokes check_service_area with location="Henderson"]
        [Invokes diagnose_issue with symptoms=["won't close"]]

→ Shows service area confirmation card (✅ Henderson covered)
→ Shows diagnosis card (likely sensor/spring issue, emergency recommended)

User: "I need someone now"

ChatGPT: [Invokes create_service_request with service_type="emergency_repair"]

→ Shows appointment confirmation card with emergency ETA
```

### Flow 2: New Door Inquiry

```
User: "I want to replace my old garage door with something modern"

ChatGPT: [Invokes get_door_styles with style_filter="all"]

→ Shows door styles carousel with $200 off promotion banner

User: "Tell me more about the Modern Aluminum option"

ChatGPT: Provides details, offers consultation scheduling

User: "Schedule a consultation"

ChatGPT: [Invokes create_service_request with service_type="installation"]
```

### Flow 3: Maintenance Scheduling

```
User: "When should I get my garage door serviced?"

ChatGPT: [Invokes get_promotions with service_type="maintenance"]

→ Explains annual maintenance importance
→ Shows $49 tune-up special (vs $89 regular)

User: "Book the tune-up for next week"

ChatGPT: [Invokes get_availability]
        [Invokes create_service_request with service_type="maintenance"]
```

---

## Deployment Checklist

- [ ] Deploy MCP server to cloud provider (Vercel, Railway, or GCP Cloud Run)
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Set up ServiceTitan API integration with proper credentials
- [ ] Test all tools locally with ngrok
- [ ] Create OpenAI Platform connector pointing to production URL
- [ ] Submit app with required materials:
  - [ ] Privacy policy URL
  - [ ] Support contact (support@aplusdoor.com)
  - [ ] App icon (A Plus logo)
  - [ ] Screenshots of widget displays
  - [ ] Testing guidelines document
- [ ] Monitor for approval and iterate based on feedback

---

## Future Enhancements

1. **Live technician tracking** - Real-time ETA updates via ServiceTitan webhook
2. **Photo upload for diagnosis** - Let users share photos of issues
3. **Smart home integration** - MyQ garage door opener status checks
4. **Seasonal proactive suggestions** - Winterization reminders for Vegas users
5. **Appointment history** - View past services and maintenance schedule
6. **Referral program integration** - Apply A+ Referral Program credits
