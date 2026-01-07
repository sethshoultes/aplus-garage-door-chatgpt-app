# A Plus Garage Door - ChatGPT MCP App

A production-ready ChatGPT MCP (Model Context Protocol) app that enables customers to check service coverage, diagnose garage door issues, and book appointments across Nevada and Utah.

## ✅ Status: Production Ready

**Deployed**: https://aplus-garage-door-chatgpt-app.vercel.app
**MCP Endpoint**: https://aplus-garage-door-chatgpt-app.vercel.app/api/mcp

## 🎯 Features

- **Service Area Checker** - Covers 11 Nevada cities and 50+ Utah cities with real-time coverage validation
- **Smart Diagnosis** - AI-powered issue identification from user-reported symptoms
- **Instant Booking** - Create service appointments with confirmation numbers
- **Interactive Widgets** - Beautiful UI cards built with React + Tailwind CSS that render in ChatGPT

## 🏗️ Architecture

### MCP Server (Vercel Serverless)
- **Endpoint**: `/api/mcp.ts` - JSON-RPC 2.0 compliant MCP server
- **Protocol**: Implements full MCP handshake (initialize, tools/list, tools/call, resources/read)
- **Data Injection**: Inlines widget data via `structuredContent` and CSS for iframe compatibility

### Widgets (React + Tailwind)
- **service-area-result** - Shows coverage status with styled badges and action buttons
- **diagnosis-result** - Displays issue analysis with urgency indicators
- **booking-confirmation** - Confirms appointments with service details

### Tools
1. `check_service_area` - Validates if location is within service coverage
2. `diagnose_issue` - Analyzes symptoms and suggests likely problems
3. `create_service_request` - Books appointments and generates confirmation

## 📁 Project Structure

```
├── api/
│   ├── mcp.ts                      # Main MCP server endpoint
│   └── test-tool.ts                # Development testing endpoint
├── src/widgets/
│   ├── src/
│   │   ├── service-area-result.tsx  # Service coverage widget
│   │   ├── diagnosis-result.tsx     # Diagnosis widget
│   │   ├── booking-confirmation.tsx # Booking widget
│   │   └── app.css                  # Tailwind CSS imports
│   ├── vite.config.ts               # Build config with absolute URLs
│   └── package.json                 # Widget dependencies
├── dist/widgets/                    # Pre-built widgets (committed)
├── docs/                            # Documentation
├── service-areas-data.json          # Coverage data for NV & UT
├── package.json
└── README.md
```

## 🚀 Quick Start

### Local Development

```bash
# Install root dependencies
npm install

# Install widget dependencies
cd src/widgets
npm install
cd ../..

# Build widgets
npm run build:widgets

# Test MCP server locally with MCPJam
npx @mcpjam/inspector@latest https://aplus-garage-door-chatgpt-app.vercel.app/api/mcp
```

### Build Widgets

```bash
cd src/widgets
npm run build
```

This builds widgets to `../../dist/widgets/` with:
- Absolute asset URLs for production
- Inlined Tailwind CSS styles
- React components compiled to ES modules

## 🔧 Deployment

### Vercel Setup

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables** (in Vercel dashboard):
   - No environment variables required - service data is in `service-areas-data.json`

### Deployment Notes

- Widgets are **pre-built** and committed to `dist/widgets/`
- `vercel-build` script just echoes confirmation (no build needed)
- MCP server runs as Vercel serverless function
- Widgets served as static files with CORS headers

## 🧪 Testing

### Test with MCPJam Inspector

```bash
# Start MCPJam (local testing tool)
npx @mcpjam/inspector@latest https://aplus-garage-door-chatgpt-app.vercel.app/api/mcp
```

Then test tools:
1. `check_service_area` with location: "Henderson"
2. `diagnose_issue` with symptoms: ["won't close", "grinding noise"]
3. `create_service_request` with booking details

### Test MCP Server Directly

```bash
# Check service area
curl -X POST https://aplus-garage-door-chatgpt-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "check_service_area",
      "arguments": {"location": "Henderson"}
    }
  }'
```

## 🔗 Connecting to ChatGPT

1. Go to [ChatGPT Custom GPTs](https://chatgpt.com/gpts/editor)
2. Create new GPT with MCP server
3. Add server URL: `https://aplus-garage-door-chatgpt-app.vercel.app/api/mcp`
4. Use HTTP transport (Streamable HTTP)
5. Test and publish

## 📊 Service Coverage

### Nevada (11 areas)
Las Vegas, Henderson, North Las Vegas, Boulder City, Mesquite, Summerlin, Paradise, Enterprise, Spring Valley, Sunrise Manor, Whitney

### Utah (50+ cities)

**Salt Lake Metro**: Salt Lake City, West Valley City, Sandy, West Jordan, South Jordan, Murray, Draper, Riverton, Taylorsville, Midvale, Cottonwood Heights, Herriman, Bluffdale, Millcreek, Holladay, South Salt Lake, Alta

**Provo/Utah Valley**: Provo, Orem, Lehi, American Fork, Spanish Fork, Springville, Payson, Pleasant Grove, Saratoga Springs, Eagle Mountain, Alpine, Highland, Lindon, Vineyard, Mapleton, Salem, Santaquin, Cedar Hills, Elk Ridge, Woodland Hills, Goshen, Genola, Cedar Fort, Fairfield

**Ogden Area**: Ogden, Roy, North Ogden, South Ogden, Riverdale, Washington Terrace, Hooper, Harrisville, Pleasant View, Farr West, Plain City, West Haven, Marriott-Slaterville, Uintah, Huntsville

**Southern Utah**: St. George

## 🛠️ Technical Implementation

### MCP Protocol
- **JSON-RPC 2.0** compliant
- **Methods**: initialize, notifications/initialized, tools/list, tools/call, resources/list, resources/read
- **Data Flow**: Tool data → `structuredContent` → `window.openai.toolOutput` → Widget

### Widget Architecture
- **React 18** with TypeScript
- **Tailwind CSS v4** with `@tailwindcss/vite`
- **Vite** for building with absolute asset URLs
- **Lucide React** for icons
- **CSS Inlining** - Server inlines CSS into HTML to bypass CSP restrictions

### Key Fixes Implemented
- ✅ Removed non-existent OpenAI Apps SDK bridge.js
- ✅ Replaced `@openai/apps-sdk-ui` components with plain Tailwind CSS
- ✅ Inlined CSS to avoid CSP blocking in iframes
- ✅ Used `window.openai.toolOutput` property (not function)
- ✅ Set absolute base URLs in Vite config
- ✅ Pre-built widgets committed to git for deployment

## 📝 License

MIT © A Plus Garage Door

## 🤝 Support

- **Nevada**: (702) 297-7811
- **Utah**: (801) 683-6222
- **Website**: [aplusgaragedoor.com](https://aplusgaragedoor.com)

---

**Built for ChatGPT with MCP** - Production-ready for 800M+ users
