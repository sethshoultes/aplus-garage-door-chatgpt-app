# A Plus Garage Door - ChatGPT App

A ChatGPT MCP app that enables customers to check service coverage, diagnose garage door issues, view promotions, and book appointments across Nevada and Utah.

## 🎯 Features

- **Service Area Checker** - Covers 11 Nevada cities and 50+ Utah cities
- **Smart Diagnosis** - AI-powered issue identification from symptoms
- **Live Promotions** - $30-$200 in savings auto-applied
- **Instant Booking** - ServiceTitan integration for scheduling
- **Interactive Widgets** - Beautiful UI cards built with React + Tailwind

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm

### Installation

```bash
# Clone and install
npm install

# Install widget dependencies
cd src/widgets
npm install
cd ../..

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start both MCP server and widget dev server
npm run dev

# Or run separately:
npm run dev:server  # MCP server on port 3000
npm run dev:widgets # Widget server on port 4444
```

The MCP server will be available at `http://localhost:3000` and widgets at `http://localhost:4444`.

### Build

```bash
npm run build
```

## 📁 Project Structure

```
├── src/
│   ├── server.ts                     # MCP server entry point
│   ├── tools/                        # 6 MCP tool handlers
│   │   ├── check-service-area.ts     # Service coverage validation
│   │   ├── diagnose-issue.ts         # Symptom analysis
│   │   ├── get-promotions.ts         # Current deals
│   │   ├── create-service-request.ts # Booking with mock ServiceTitan
│   │   ├── get-availability.ts       # Scheduling slots
│   │   └── get-door-styles.ts        # Product catalog
│   └── widgets/                      # React widgets
│       ├── src/                      # Widget components
│       └── *.html                    # Widget entry points
├── service-areas-data.json           # 60+ cities across NV & UT
├── package.json
└── README.md
```

## 🛠️ Configuration

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development
WIDGET_BASE_URL=http://localhost:4444

# Mock Mode (for testing)
USE_MOCK_API=true

# ServiceTitan (for production)
# SERVICETITAN_API_URL=https://api.servicetitan.io/v2
# SERVICETITAN_API_KEY=your_key
# SERVICETITAN_TENANT_ID=your_tenant

# Contact Info
PHONE_NEVADA=(702) 297-7811
PHONE_UTAH=(801) 683-6222
```

## 🧪 Testing

### Test Service Area Coverage

```javascript
// Test Nevada
curl -X POST http://localhost:3000/mcp \
  -d '{"tool": "check_service_area", "location": "Henderson"}'

// Test Utah
curl -X POST http://localhost:3000/mcp \
  -d '{"tool": "check_service_area", "location": "Salt Lake City"}'
```

### Test Diagnosis

```javascript
curl -X POST http://localhost:3000/mcp \
  -d '{"tool": "diagnose_issue", "symptoms": ["won\'t close", "loud grinding"]}'
```

### Test Booking

```javascript
curl -X POST http://localhost:3000/mcp \
  -d '{
    "tool": "create_service_request",
    "service_type": "emergency_repair",
    "issue_summary": "Door won\'t close",
    "customer_name": "John Doe",
    "phone": "702-555-0100",
    "address": "123 Main St, Las Vegas, NV 89123"
  }'
```

## 📦 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `NODE_ENV=production`
   - `WIDGET_BASE_URL=https://your-app.vercel.app/widgets`
   - Other vars from `.env.example`

### Vercel Configuration

The project includes `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/widgets/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/widgets/(.*)",
      "dest": "/dist/widgets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/server.js"
    }
  ]
}
```

## 🔗 Connecting to ChatGPT

1. Deploy your app to Vercel
2. Get your production URL (e.g., `https://aplus-garage.vercel.app`)
3. Go to [ChatGPT Apps Platform](https://chatgpt.com/gpts/editor)
4. Create new GPT:
   - **Name**: A Plus Garage Door
   - **Description**: "24/7 emergency garage door service across Nevada and Utah. Check coverage, diagnose issues, view promotions, and book appointments."
   - **Instructions**: "Help users with garage door issues in Nevada and Utah. Use tools to check service areas, diagnose problems, show promotions, and book service."
5. Add MCP server:
   - **Server URL**: `https://your-app.vercel.app/mcp`
   - **Transport**: HTTP
6. Test and publish!

## 📊 Service Coverage

### Nevada (11 areas)
Las Vegas, Henderson, North Las Vegas, Boulder City, Mesquite, Summerlin, Paradise, Enterprise, Spring Valley, Sunrise Manor, Whitney

### Utah (50+ cities)

**Salt Lake Metro**: Salt Lake City, West Valley City, Sandy, West Jordan, South Jordan, Murray, Draper, Riverton, Taylorsville, Midvale, Cottonwood Heights, Herriman, Bluffdale, Millcreek, Holladay, South Salt Lake, Alta

**Provo/Utah Valley**: Provo, Orem, Lehi, American Fork, Spanish Fork, Springville, Payson, Pleasant Grove, Saratoga Springs, Eagle Mountain, Alpine, Highland, Lindon, Vineyard, Mapleton, Salem, Santaquin, Cedar Hills, Elk Ridge, Woodland Hills, Goshen, Genola, Cedar Fort, Fairfield

**Ogden Area**: Ogden, Roy, North Ogden, South Ogden, Riverdale, Washington Terrace, Hooper, Harrisville, Pleasant View, Farr West, Plain City, West Haven, Marriott-Slaterville, Uintah, Huntsville

**Southern Utah**: St. George

## 🎁 Current Promotions

- **Spring Special**: $75 OFF 2 Springs / $30 OFF 1
- **New Door**: $200 OFF Any Installation
- **Tune-Up**: $49 (Reg. $89) - 24-Point Inspection
- **Opener Special**: $100 OFF LiftMaster Elite
- **Winterization**: 50% OFF Rollers & Seals

## 🏗️ Extending the App

### Adding a New Tool

1. Create `src/tools/your-tool.ts`:
   ```typescript
   import { z } from "zod";

   const InputSchema = z.object({
     // your parameters
   });

   export const yourTool = {
     name: "your_tool_name",
     metadata: {
       title: "Tool Title",
       description: "When to use this tool",
       inputSchema: InputSchema.shape,
       _meta: {
         "openai/outputTemplate": `${process.env.WIDGET_BASE_URL}/your-widget.html`,
         "openai/toolInvocation/invoking": "Processing...",
         "openai/toolInvocation/invoked": "Done!",
       },
     },
     handler: async (input) => {
       // your logic
       return { structuredContent: { ... } };
     },
   };
   ```

2. Import in `src/server.ts`
3. Add to `tools` array

### Adding a New Widget

1. Create `src/widgets/your-widget.html`
2. Create `src/widgets/src/your-widget.tsx`
3. Add to `vite.config.ts` inputs
4. Reference in tool's `outputTemplate`

## 📝 License

MIT © A Plus Garage Door

## 🤝 Support

- **Nevada**: (702) 297-7811
- **Utah**: (801) 683-6222
- **Website**: [aplusgaragedoor.com](https://aplusgaragedoor.com)

---

**Built for the ChatGPT Apps SDK** - Serving 800M+ ChatGPT users
