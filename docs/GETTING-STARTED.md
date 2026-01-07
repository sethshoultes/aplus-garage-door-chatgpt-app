# Getting Started - A Plus Garage Door ChatGPT App

This guide will get you from zero to a running demo in under 10 minutes.

## Prerequisites

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **pnpm** (recommended) or npm: `npm install -g pnpm`
- **Git**: For version control
- **(Optional) Vercel CLI**: `npm install -g vercel`

## Step 1: Install Dependencies

```bash
# In project root
npm install

# Install widget dependencies
cd src/widgets
npm install
cd ../..
```

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (defaults work for local dev)
```

The default `.env` uses mock ServiceTitan API, so no credentials needed for testing!

## Step 3: Start Development Servers

```bash
# Start both MCP server and widget dev server
npm run dev
```

This runs:
- **MCP Server**: http://localhost:3000
- **Widget Server**: http://localhost:4444

You should see:
```
HTTP server running on http://localhost:3000
Widgets available at http://localhost:3000/widgets/
```

## Step 4: Test the Tools

### Test in Terminal

```bash
# In a new terminal window, test the health endpoint
curl http://localhost:3000/health

# You should see:
# {"status":"ok","version":"1.0.0","tools":["check_service_area","diagnose_issue",...]}
```

### Test Service Area Checker

```bash
# Test Nevada location
curl -X POST http://localhost:3000/test-tool \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "check_service_area",
    "params": {"location": "Henderson"}
  }'

# Test Utah location
curl -X POST http://localhost:3000/test-tool \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "check_service_area",
    "params": {"location": "Salt Lake City"}
  }'
```

### Test Diagnosis Tool

```bash
curl -X POST http://localhost:3000/test-tool \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "diagnose_issue",
    "params": {
      "symptoms": ["won'\''t close", "loud grinding"]
    }
  }'
```

### Test Booking

```bash
curl -X POST http://localhost:3000/test-tool \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_service_request",
    "params": {
      "service_type": "emergency_repair",
      "issue_summary": "Door won'\''t close",
      "customer_name": "John Doe",
      "phone": "702-555-0100",
      "address": "123 Main St, Las Vegas, NV 89123"
    }
  }'
```

## Step 5: View Widgets

Open a browser and navigate to:

```
http://localhost:4444/service-area-result.html
```

You should see the widget interface.

## Step 6: Build for Production

```bash
# Build everything
npm run build

# This creates:
# - dist/server.js (MCP server)
# - dist/widgets/* (Built widget bundles)
```

## Step 7: Deploy to Vercel

```bash
# Login to Vercel (first time only)
vercel login

# Deploy
vercel

# Follow prompts:
# - Project name: aplus-garage-door
# - Settings: Accept defaults

# Production deployment
vercel --prod
```

After deployment, Vercel will give you a URL like:
```
https://aplus-garage-door.vercel.app
```

## Step 8: Configure Environment Variables in Vercel

Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these:
- `NODE_ENV` = `production`
- `WIDGET_BASE_URL` = `https://your-app.vercel.app/widgets`
- `USE_MOCK_API` = `true` (or `false` when you have ServiceTitan credentials)
- `PHONE_NEVADA` = `(702) 297-7811`
- `PHONE_UTAH` = `(801) 683-6222`

Optional (for production with real ServiceTitan):
- `SERVICETITAN_API_URL` = Your ServiceTitan API URL
- `SERVICETITAN_API_KEY` = Your API key
- `SERVICETITAN_TENANT_ID` = Your tenant ID

## Step 9: Test Production Deployment

```bash
# Health check
curl https://your-app.vercel.app/health

# Should return status: "ok"
```

## Step 10: Connect to ChatGPT (When Ready)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create a new GPT
3. Configure:
   - **Name**: A Plus Garage Door
   - **Description**: "24/7 garage door service in Nevada and Utah"
   - **MCP Server URL**: `https://your-app.vercel.app/mcp`
4. Test with sample queries
5. Submit for review

---

## Troubleshooting

### "Module not found" errors

```bash
# Make sure you installed dependencies in both locations:
npm install
cd src/widgets && npm install && cd ../..
```

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

### Widgets not loading

```bash
# Make sure widget dev server is running
cd src/widgets
npm run dev
```

### TypeScript errors

```bash
# Rebuild
npm run build:server
```

### Vercel deployment fails

```bash
# Make sure build works locally first
npm run build

# Check vercel logs
vercel logs
```

---

## Quick Reference

### Development Commands

```bash
npm run dev              # Start both servers
npm run dev:server       # MCP server only
npm run dev:widgets      # Widget dev server only
npm run build            # Build for production
npm run typecheck        # Type checking
```

### File Locations

```
src/server.ts            # Main MCP server
src/tools/*.ts           # 6 tool handlers
src/widgets/src/*.tsx    # Widget React components
src/widgets/*.html       # Widget HTML entry points
service-areas-data.json  # Service coverage data
.env                     # Environment configuration
```

### Important URLs (Local)

- MCP Server: http://localhost:3000
- Widget Dev: http://localhost:4444
- Health Check: http://localhost:3000/health

### Important URLs (Production)

- MCP Server: https://your-app.vercel.app
- Widgets: https://your-app.vercel.app/widgets/
- Health Check: https://your-app.vercel.app/health

---

## Next Steps

1. ✅ Project running locally
2. ✅ Tools tested and working
3. ✅ Widgets rendering
4. 📋 Review DEMO-SCRIPT.md for presentation guide
5. 📋 Review PROPOSAL.md for business case
6. 🚀 Deploy to Vercel
7. 🎯 Present to A Plus Garage Door
8. 📝 Get ServiceTitan credentials
9. 🌐 Submit to OpenAI
10. 🎉 Launch!

---

## Support

If you run into issues:

1. Check this guide first
2. Review README.md for detailed documentation
3. Check error logs: `npm run dev` shows real-time errors
4. Verify all dependencies installed
5. Ensure ports 3000 and 4444 are available

---

**You're all set! Happy building! 🚀**
