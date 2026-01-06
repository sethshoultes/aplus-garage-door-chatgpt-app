# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ChatGPT MCP (Model Context Protocol) app for A Plus Garage Door that enables customers to check service coverage, diagnose issues, view promotions, and book appointments within ChatGPT conversations.

**Target deployment:** ChatGPT app accessible to 800M+ users
**Service area:** Las Vegas Valley (Henderson, Summerlin, North Las Vegas, etc.)
**Integration:** ServiceTitan API for scheduling and booking

## Architecture

### MCP Server Pattern
- **Protocol:** Model Context Protocol (MCP) over HTTPS
- **Runtime:** Node.js with TypeScript
- **Framework:** Express + `@modelcontextprotocol/sdk`
- **Validation:** Zod schemas for all tool inputs
- **Widgets:** Inline HTML cards with Tailwind CSS + OpenAI Bridge JS

### Project Structure (Planned)
```
src/
├── server.ts                    # MCP server entry point
├── tools/                       # MCP tool handlers
│   ├── check-service-area.ts
│   ├── diagnose-issue.ts
│   ├── get-promotions.ts
│   ├── create-service-request.ts
│   ├── get-availability.ts
│   └── get-door-styles.ts
├── services/                    # External integrations
│   ├── servicetitan.ts         # ServiceTitan API client
│   ├── promotions.ts
│   └── diagnostics.ts
├── widgets/                     # HTML widget templates
│   ├── service-area-result.html
│   ├── diagnosis-result.html
│   ├── appointment-confirmation.html
│   ├── promotions-carousel.html
│   └── door-styles-carousel.html
└── data/                        # Static data
    ├── service-areas.json
    ├── promotions.json
    └── diagnostic-tree.json
```

## 6 Core MCP Tools

1. **check_service_area** - Validates Las Vegas Valley coverage by location/zip
2. **diagnose_issue** - Analyzes symptoms to identify likely problems
3. **get_promotions** - Retrieves current deals (auto-applies to diagnosis)
4. **create_service_request** - Books appointments via ServiceTitan integration
5. **get_availability** - Checks technician availability slots
6. **get_door_styles** - Shows new door options with pricing

## Key Implementation Details

### Tool Metadata Requirements
Each tool MUST include:
- `name` - Tool identifier (snake_case)
- `metadata.title` - Display name
- `metadata.description` - When to invoke the tool
- `metadata.inputSchema` - Zod schema for validation
- `metadata._meta` - OpenAI-specific metadata:
  - `openai/outputTemplate` - Widget URL (e.g., `ui://widget/diagnosis-result.html`)
  - `openai/toolInvocation/invoking` - Loading message
  - `openai/toolInvocation/invoked` - Success message
  - `openai/confirmationRequired` - Boolean (true for booking)

### Widget Pattern
All widgets follow this structure:
- Load OpenAI Bridge SDK: `<script src="https://cdn.openai.com/apps-sdk/bridge.js"></script>`
- Use Tailwind CSS: `<script src="https://cdn.tailwindcss.com"></script>`
- Fetch tool output: `const data = await openai.getToolOutput()`
- User actions:
  - `openai.sendMessage()` - Send message to ChatGPT
  - `openai.openUrl()` - Open URL (tel:, https:, etc.)

### ServiceTitan Integration
- API endpoint: `process.env.SERVICETITAN_API_URL`
- Authentication: Bearer token via `process.env.SERVICETITAN_API_KEY`
- Job type mapping:
  - `emergency_repair` → `EMERGENCY`
  - `standard_repair` → `REPAIR`
  - `installation` → `INSTALL`
  - `maintenance` → `MAINTENANCE`

### Service Areas (11 Vegas Valley Locations)
Las Vegas, Henderson, North Las Vegas, Summerlin, Paradise, Spring Valley, Enterprise, Boulder City, Mesquite, Sunrise Manor, Whitney

Zip prefixes: `890*`, `891*`

### Current Promotions (Auto-Applied by Diagnosis)
- **Spring Special:** $75 off 2 springs / $30 off 1
- **New Door:** $200 off any installation
- **Tune-Up:** $49 (reg $89) - includes 24-point inspection
- **Opener Special:** $100 off LiftMaster Elite
- **Winterization:** 50% off rollers, seals, weather trim

### Diagnostic Logic
Symptom → Issue → Urgency level:
- `won't open/close` → broken spring/sensor → **emergency**
- `loud grinding` → worn rollers → **soon**
- `remote not working` → battery/opener → **routine**

Safety warnings for: broken springs, broken cables

## Development Commands

### Installation
```bash
npm install
# or
yarn install
```

### Local Development
```bash
npm run dev
# Runs server with hot reload
```

### Build
```bash
npm run build
# Compiles TypeScript to dist/
```

### Testing with ngrok
```bash
# Terminal 1: Start local server
npm run dev

# Terminal 2: Expose via ngrok
ngrok http 3000

# Use ngrok HTTPS URL in ChatGPT connector config
```

### Type Checking
```bash
npm run typecheck
```

## Environment Variables

Required `.env` file:
```bash
SERVICETITAN_API_URL=https://api.servicetitan.io/v2
SERVICETITAN_API_KEY=your_api_key
SERVICETITAN_TENANT_ID=your_tenant_id
PORT=3000
NODE_ENV=production
```

## Deployment

**Recommended platforms:**
- Vercel (zero-config TypeScript)
- Railway (easy env vars)
- GCP Cloud Run (scalable)

**Requirements:**
- HTTPS endpoint (ChatGPT requires SSL)
- `/mcp` POST endpoint for MCP protocol
- `/widget/*` static file serving for HTML widgets
- `/health` GET endpoint for monitoring

## Code Style

- Use TypeScript strict mode
- Zod schemas for all external inputs
- Async/await (no callbacks)
- Error handling: return structured errors to ChatGPT (don't throw)
- Widget styling: Tailwind utility classes, mobile-first

## Testing Strategy

Before deployment:
1. Test each tool locally with sample inputs
2. Verify widgets render correctly in browser
3. Test ServiceTitan API integration with sandbox credentials
4. Use ngrok to test full ChatGPT → MCP → ServiceTitan flow
5. Validate promotion auto-application logic
6. Confirm emergency booking creates same-day slots

## Key Considerations

### User Experience
- Emergency service (24/7) should always show "call now" option
- Promotions auto-apply based on diagnosed issue
- Appointment confirmations include cancellation policy
- All widgets show phone number: (702) 297-7811

### Data Accuracy
- Service areas verified against actual A Plus coverage
- Promotions expire (check `valid_until` dates)
- Cost estimates must match current pricing
- Diagnostic tree based on real technician feedback

### Security
- Never expose ServiceTitan credentials in frontend
- Validate all user inputs with Zod
- Sanitize customer data before ServiceTitan submission
- Rate limit booking endpoint to prevent spam

## Common Development Tasks

### Add a new promotion
1. Edit `src/data/promotions.json`
2. Update `PROMOTIONS` array in `src/tools/get-promotions.ts`
3. Map issue types to promotion in diagnostic logic

### Add a new service area
1. Edit `src/data/service-areas.json`
2. Add to `SERVICE_AREAS` array in `src/tools/check-service-area.ts`
3. Include zip prefixes and coordinates

### Update diagnostic tree
1. Edit `src/data/diagnostic-tree.json`
2. Update `DIAGNOSTIC_TREE` in `src/tools/diagnose-issue.ts`
3. Map symptoms → issues → urgency + cost ranges

### Create a new widget
1. Create HTML file in `src/widgets/`
2. Include OpenAI Bridge SDK
3. Fetch data with `openai.getToolOutput()`
4. Reference in tool's `outputTemplate` metadata

## Debugging

### Widget not displaying
- Check browser console for Bridge SDK errors
- Verify `openai/outputTemplate` URL is correct
- Ensure widget is served from `/widget/` path

### ServiceTitan booking fails
- Verify API credentials in `.env`
- Check job type mapping matches ServiceTitan schema
- Review API response for validation errors
- Ensure tenant ID is correct

### Tool not invoked by ChatGPT
- Review tool `description` - be specific about when to invoke
- Check Zod schema matches expected user input
- Verify tool is registered in `server.ts`

## Documentation References

- Full architecture: `ARCHITECTURE.md`
- Visual summary: `SUMMARY.md`
- MCP SDK: https://github.com/modelcontextprotocol/sdk
- OpenAI Apps: https://platform.openai.com/docs/apps
- ServiceTitan API: https://developer.servicetitan.io
