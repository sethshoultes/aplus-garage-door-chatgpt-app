# Implementation Checklist
## A Plus Garage Door - ChatGPT MCP Server v2.0

**Last Updated:** January 7, 2026

---

## Phase 1: Database & Core Security (Week 1)

### 1.1 Database Setup
- [ ] Install Vercel Postgres integration in Vercel dashboard
- [ ] Install Prisma dependencies (`npm install prisma @prisma/client`)
- [ ] Create `prisma/schema.prisma` file
- [ ] Define database schema (bookings, service_areas, promotions, sync_logs, admin_users)
- [ ] Run `npx prisma migrate dev --name init` to create initial migration
- [ ] Seed service areas from `service-areas-data.json` to database
- [ ] Verify database connection with test query

**Deliverable:** Working Vercel Postgres database with all tables and test data.

---

### 1.2 Security Fixes
- [ ] Create Zod validation schemas in `lib/validation.ts`:
  - [ ] `customerNameSchema`
  - [ ] `phoneSchema` (with formatting)
  - [ ] `emailSchema` (optional)
  - [ ] `addressSchema`
  - [ ] `symptomsSchema`
  - [ ] `serviceTypeSchema`
- [ ] Fix XSS vulnerability in `api/mcp.ts`:
  - [ ] Install `isomorphic-dompurify`
  - [ ] Replace JSON.stringify with sanitized version
  - [ ] OR implement HTML entity escaping function
- [ ] Replace `Date.now()` confirmation numbers with `crypto.randomUUID()`
- [ ] Add input validation to all MCP tool handlers

**Deliverable:** All XSS vulnerabilities fixed, inputs validated.

---

### 1.3 Environment Variables
- [ ] Create `.env.local` file with:
  ```bash
  DATABASE_URL=postgresql://...
  NEXT_PUBLIC_WIDGET_BASE_URL=https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets
  ```
- [ ] Update `.env.example` with all required variables
- [ ] Add environment variables to Vercel dashboard
- [ ] Replace hardcoded widget URLs with `process.env.NEXT_PUBLIC_WIDGET_BASE_URL`

**Deliverable:** All config moved to environment variables.

---

### 1.4 Update MCP Server
- [ ] Install Prisma client in MCP server
- [ ] Update `checkServiceArea()` to read from database instead of JSON
- [ ] Update `diagnoseIssue()` to read promotions from database
- [ ] Update `createServiceRequest()` to:
  - [ ] Validate inputs with Zod schemas
  - [ ] Generate UUID confirmation number
  - [ ] Save booking to database
  - [ ] Return confirmation from DB (not fake data)
- [ ] Add error handling for database failures
- [ ] Add TypeScript interfaces for all function parameters

**Deliverable:** MCP server saves 100% of bookings to database.

---

### 1.5 Testing & Deployment
- [ ] Create 10 test bookings via MCPJam
- [ ] Verify all bookings appear in database
- [ ] Test XSS attack → verify blocked
- [ ] Check confirmation numbers are unique UUIDs
- [ ] Test service area check with database
- [ ] Deploy to Vercel production
- [ ] Verify production environment variables set
- [ ] Test end-to-end flow in production

**Deliverable:** Phase 1 deployed to production with 100% booking capture.

---

## Phase 2: Admin Interface MVP (Week 2)

### 2.1 Next.js Admin App Setup
- [ ] Create new Next.js app in `/admin` directory:
  ```bash
  npx create-next-app@latest admin --typescript --tailwind --app
  ```
- [ ] Install dependencies:
  ```bash
  npm install @prisma/client @clerk/nextjs
  npm install shadcn-ui react-hook-form zod @hookform/resolvers
  npm install recharts date-fns lucide-react
  ```
- [ ] Set up Prisma client (symlink to main schema)
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up folder structure:
  ```
  admin/
  ├── app/
  │   ├── (auth)/
  │   │   ├── sign-in/
  │   │   └── sign-up/
  │   ├── (dashboard)/
  │   │   ├── layout.tsx
  │   │   ├── page.tsx (dashboard)
  │   │   ├── bookings/
  │   │   ├── service-areas/
  │   │   ├── promotions/
  │   │   ├── sync/
  │   │   └── settings/
  │   └── api/
  │       └── admin/
  ├── components/
  │   ├── ui/ (shadcn components)
  │   ├── bookings/
  │   ├── service-areas/
  │   └── promotions/
  ├── lib/
  │   ├── db.ts (Prisma client)
  │   ├── validation.ts (Zod schemas)
  │   └── utils.ts
  └── prisma/ (symlinked)
  ```

**Deliverable:** Admin app skeleton with routing and auth.

---

### 2.2 Authentication (Clerk)
- [ ] Create Clerk account at clerk.dev
- [ ] Create new application in Clerk dashboard
- [ ] Copy API keys to `.env.local`:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
  CLERK_SECRET_KEY=sk_live_...
  ```
- [ ] Install Clerk middleware in `admin/middleware.ts`
- [ ] Protect all `/admin/*` routes
- [ ] Create sign-in and sign-up pages
- [ ] Add Clerk UserButton to admin layout
- [ ] Set up role-based access control (admin, dispatcher, viewer)
- [ ] Test authentication flow

**Deliverable:** Admin interface requires authentication.

---

### 2.3 Dashboard Page
- [ ] Create `admin/app/(dashboard)/page.tsx`
- [ ] Build stats cards component:
  - [ ] Total Bookings Today
  - [ ] Pending ST Sync (with warning badge)
  - [ ] Revenue Estimate Today
  - [ ] Active Promotions
- [ ] Build recent bookings table component:
  - [ ] Fetch last 10 bookings from DB
  - [ ] Display: Time, Customer, Phone, Issue, Status
  - [ ] Add quick actions: View, Sync to ST, Call
- [ ] Build Service Titan sync status widget:
  - [ ] Success rate (last 24h)
  - [ ] Failed syncs count
  - [ ] Queue depth
- [ ] Add real-time updates (polling every 30s)
- [ ] Style with Tailwind CSS

**Deliverable:** Functional dashboard with live data.

---

### 2.4 Bookings Page
- [ ] Create `admin/app/(dashboard)/bookings/page.tsx`
- [ ] Build filters component:
  - [ ] Date range picker
  - [ ] Status dropdown
  - [ ] ST Sync Status dropdown
  - [ ] Service Type dropdown
  - [ ] Search input (customer name/phone/confirmation)
- [ ] Build bookings table component:
  - [ ] Columns: Confirmation #, Date/Time, Customer, Phone, Service Type, Issue, Urgency, Cost, ST Sync, Actions
  - [ ] Pagination (20 per page)
  - [ ] Sortable columns
  - [ ] Row actions: View, Sync to ST, Call, Edit, Cancel
- [ ] Build booking detail modal:
  - [ ] Customer information section
  - [ ] Service details section
  - [ ] Service Titan status section
  - [ ] Action buttons: Sync to ST, Edit, Cancel
- [ ] Add bulk actions:
  - [ ] Select multiple bookings
  - [ ] Bulk sync to ST
  - [ ] Export to CSV
- [ ] Implement search functionality
- [ ] Add loading states and error handling

**Deliverable:** Bookings page with filtering, search, and detail view.

---

### 2.5 Manual Service Titan Sync
- [ ] Create API route: `admin/app/api/admin/bookings/[id]/sync/route.ts`
- [ ] Install Service Titan SDK (if available) or use fetch
- [ ] Implement Service Titan API client in `lib/servicetitan.ts`:
  - [ ] `createJob(booking)` function
  - [ ] `getCustomer(phone)` function (or create if not exists)
  - [ ] `getAvailability(date)` function
- [ ] Add Service Titan sync logic:
  - [ ] Validate booking data
  - [ ] Create/lookup customer in ST
  - [ ] Create job in ST
  - [ ] Update booking with ST job ID
  - [ ] Create sync log entry
  - [ ] Handle errors gracefully
- [ ] Add "Sync to Service Titan" button in booking detail modal
- [ ] Show sync status (pending, syncing, synced, failed)
- [ ] Display error message if sync fails
- [ ] Add retry button for failed syncs

**Deliverable:** Manual sync button creates jobs in Service Titan.

---

### 2.6 Service Areas CRUD
- [ ] Create `admin/app/(dashboard)/service-areas/page.tsx`
- [ ] Build service areas table:
  - [ ] Columns: Name, State, Zip Prefixes, Phone, Priority, Active, Actions
  - [ ] Sort by priority, name, state
  - [ ] Filter by state, active status
- [ ] Build service area form modal (add/edit):
  - [ ] Form fields: Name, Type, State, Zip Prefixes, Phone, Timezone, Priority, Emergency Available, Emergency Hours, Coordinates, Active, Notes
  - [ ] Zod validation
  - [ ] React Hook Form integration
- [ ] Create API routes:
  - [ ] `GET /api/admin/service-areas` - List
  - [ ] `POST /api/admin/service-areas` - Create
  - [ ] `PATCH /api/admin/service-areas/[id]` - Update
  - [ ] `DELETE /api/admin/service-areas/[id]` - Delete (soft delete)
- [ ] Add confirmation dialog for delete
- [ ] Test adding new service area → verify MCP recognizes it

**Deliverable:** Service areas manageable via admin UI.

---

### 2.7 Promotions CRUD
- [ ] Create `admin/app/(dashboard)/promotions/page.tsx`
- [ ] Build promotions grid/table:
  - [ ] Card view: Code, Title, Discount, Valid Dates, Usage, Active toggle
  - [ ] Table view toggle
  - [ ] Filter: Active, Expired, Upcoming
  - [ ] Sort: Priority, Valid From, Valid Until
- [ ] Build promotion form modal (add/edit):
  - [ ] Form fields: Code, Title, Description, Discount Type, Discount Value, Applies To, Min Service Cost, Valid From, Valid Until, Max Uses, Display Priority, Badge Text, Active, Notes
  - [ ] Zod validation
  - [ ] React Hook Form integration
- [ ] Create API routes:
  - [ ] `GET /api/admin/promotions` - List
  - [ ] `POST /api/admin/promotions` - Create
  - [ ] `PATCH /api/admin/promotions/[id]` - Update
  - [ ] `DELETE /api/admin/promotions/[id]` - Delete
- [ ] Add usage tracking (increment on booking creation)
- [ ] Test creating promotion → verify applied in diagnosis widget

**Deliverable:** Promotions manageable via admin UI.

---

### 2.8 Admin Deployment
- [ ] Create separate Vercel project for admin app
- [ ] Configure environment variables in Vercel
- [ ] Set up custom domain: `admin.aplus-garage-door.com`
- [ ] Deploy to production
- [ ] Test authentication in production
- [ ] Test all CRUD operations
- [ ] Create admin user accounts for office staff
- [ ] Document admin user guide

**Deliverable:** Admin interface live at admin.aplus-garage-door.com.

---

## Phase 3: Service Titan Integration (Week 2-3)

### 3.1 Service Titan API Setup
- [ ] Obtain Service Titan API credentials from A Plus account
- [ ] Add credentials to environment variables:
  ```bash
  SERVICE_TITAN_API_KEY=sk_live_...
  SERVICE_TITAN_TENANT_ID=...
  SERVICE_TITAN_API_URL=https://api.servicetitan.io/v2
  ```
- [ ] Test API connection:
  - [ ] Create test script to list customers
  - [ ] Verify authentication works
  - [ ] Document available endpoints
  - [ ] Check rate limits

**Deliverable:** Service Titan API accessible and tested.

---

### 3.2 Job Queue Setup (Inngest)
- [ ] Create Inngest account at inngest.com
- [ ] Install Inngest SDK:
  ```bash
  npm install inngest
  ```
- [ ] Create Inngest client in `lib/inngest.ts`
- [ ] Create Inngest API route: `api/inngest/route.ts`
- [ ] Define Inngest functions:
  - [ ] `syncBookingToServiceTitan` - Main sync function
  - [ ] `retryFailedSync` - Retry logic
- [ ] Configure Inngest dashboard
- [ ] Set up Vercel integration
- [ ] Test event triggering

**Deliverable:** Inngest job queue working.

---

### 3.3 Automatic Sync Implementation
- [ ] Update `createServiceRequest()` in MCP server:
  - [ ] After saving booking to DB, trigger Inngest event
  - [ ] Event payload: `{ bookingId }`
- [ ] Implement `syncBookingToServiceTitan` Inngest function:
  - [ ] Fetch booking from DB
  - [ ] Validate booking has all required data
  - [ ] Create/lookup customer in Service Titan
  - [ ] Create job in Service Titan with correct job type
  - [ ] Update booking with ST job ID
  - [ ] Set `st_sync_status` to 'synced'
  - [ ] Create sync log entry
  - [ ] Handle errors → set status to 'failed'
- [ ] Implement retry logic:
  - [ ] Exponential backoff: 1 min, 5 min, 15 min
  - [ ] Max 3 attempts
  - [ ] After 3 failures, alert admin
- [ ] Add error handling for common scenarios:
  - [ ] ST API down → retry
  - [ ] Invalid data → set to 'manual' status
  - [ ] Duplicate job → update existing
  - [ ] Rate limit → backoff

**Deliverable:** Bookings automatically sync to Service Titan.

---

### 3.4 Webhook Handler
- [ ] Create Service Titan webhook endpoint: `api/webhooks/servicetitan/route.ts`
- [ ] Implement webhook signature verification
- [ ] Handle webhook events:
  - [ ] Job status changed
  - [ ] Job scheduled
  - [ ] Job completed
  - [ ] Job cancelled
- [ ] Update booking status in DB based on webhook
- [ ] Add webhook event logging
- [ ] Register webhook URL in Service Titan dashboard
- [ ] Test webhook with ST test events

**Deliverable:** Booking status updates from Service Titan.

---

### 3.5 Sync Status Dashboard
- [ ] Create `admin/app/(dashboard)/sync/page.tsx`
- [ ] Build auto-sync status section:
  - [ ] Toggle to enable/disable auto-sync
  - [ ] Current status indicator
  - [ ] Last run timestamp
  - [ ] Next run countdown
- [ ] Build manual sync queue table:
  - [ ] List pending/failed bookings
  - [ ] Bulk select and sync
  - [ ] Individual retry button
  - [ ] Error details (expandable)
- [ ] Build sync history table:
  - [ ] Recent sync attempts (last 100)
  - [ ] Columns: Time, Booking, Status, Duration, Error, Triggered By
  - [ ] Filter by status, date range
  - [ ] Search by booking confirmation
- [ ] Add settings section:
  - [ ] Test ST API connection button
  - [ ] View API credentials (masked)
  - [ ] Configure retry settings
- [ ] Add real-time updates for sync status

**Deliverable:** Sync monitoring dashboard.

---

### 3.6 Alerts & Notifications
- [ ] Set up email notifications (Resend):
  - [ ] Create Resend account
  - [ ] Add API key to environment
  - [ ] Create email template for failed sync
- [ ] Set up Slack notifications (optional):
  - [ ] Create Slack webhook
  - [ ] Add webhook URL to environment
  - [ ] Send alert for new emergency bookings
  - [ ] Send alert for persistent sync failures
- [ ] Implement notification logic:
  - [ ] Email admin after 3 failed sync attempts
  - [ ] Slack message for emergency bookings
  - [ ] Daily summary email (optional)

**Deliverable:** Alerts sent for sync failures and emergencies.

---

### 3.7 Testing & Monitoring
- [ ] Test automatic sync end-to-end:
  - [ ] Create booking via ChatGPT
  - [ ] Verify Inngest event triggered
  - [ ] Verify job created in Service Titan
  - [ ] Check booking updated with ST job ID
- [ ] Test failure scenarios:
  - [ ] Simulate ST API down → verify retry
  - [ ] Invalid booking data → verify manual status
  - [ ] Network timeout → verify retry
- [ ] Test webhook:
  - [ ] Trigger job status change in ST
  - [ ] Verify booking status updated
- [ ] Monitor Inngest dashboard for errors
- [ ] Set up alerts for high failure rate

**Deliverable:** Service Titan integration tested and monitored.

---

## Phase 4: Polish & Production Readiness (Week 3-4)

### 4.1 Error Monitoring (Sentry)
- [ ] Create Sentry account at sentry.io
- [ ] Create project for MCP server
- [ ] Create project for admin app
- [ ] Install Sentry SDK:
  ```bash
  npm install @sentry/nextjs
  ```
- [ ] Configure Sentry in `sentry.client.config.ts` and `sentry.server.config.ts`
- [ ] Add environment variables:
  ```bash
  SENTRY_DSN=https://...@sentry.io/...
  NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
  ```
- [ ] Wrap MCP tool handlers with Sentry error tracking
- [ ] Add breadcrumbs for debugging
- [ ] Test error capture (throw test error)
- [ ] Set up alerts for error rate >1%

**Deliverable:** All errors tracked in Sentry.

---

### 4.2 Rate Limiting (Upstash Redis)
- [ ] Create Upstash account at upstash.com
- [ ] Create Redis database
- [ ] Add environment variables:
  ```bash
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...
  ```
- [ ] Install Upstash SDK:
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```
- [ ] Implement rate limiting middleware in `api/mcp.ts`:
  - [ ] 10 requests per minute per IP
  - [ ] Return 429 status if exceeded
  - [ ] Add Retry-After header
- [ ] Test rate limiting:
  - [ ] Send 15 requests in 1 minute
  - [ ] Verify 11th request blocked
- [ ] Monitor rate limit hits in Upstash dashboard

**Deliverable:** Rate limiting prevents abuse.

---

### 4.3 Fix Zip Code Logic
- [ ] Update `checkServiceArea()` in `api/mcp.ts`:
  - [ ] Query database for matching zip prefixes
  - [ ] Sort by priority (highest first)
  - [ ] Return first match
  - [ ] Handle ZIP+4 format (strip last 4 digits)
  - [ ] Add partial city name matching
  - [ ] Add state abbreviation parsing ("Las Vegas, NV" → "Las Vegas")
- [ ] Add unit tests for edge cases:
  - [ ] "890" matches multiple cities → returns highest priority
  - [ ] "89123-1234" → strips to "89123"
  - [ ] "Las Vegas, NV" → matches "Las Vegas"
  - [ ] "salt lake" → matches "Salt Lake City"
- [ ] Test in MCPJam with various inputs

**Deliverable:** Zip code search handles all edge cases.

---

### 4.4 Logging Cleanup
- [ ] Install structured logging library:
  ```bash
  npm install pino pino-pretty
  ```
- [ ] Create logger in `lib/logger.ts`
- [ ] Replace all `console.log` with logger:
  - [ ] `logger.info()` for info messages
  - [ ] `logger.warn()` for warnings
  - [ ] `logger.error()` for errors
  - [ ] `logger.debug()` for debug (only in dev)
- [ ] Add context to logs:
  - [ ] Tool name
  - [ ] Session ID
  - [ ] User input (sanitized)
- [ ] Configure log levels per environment:
  - [ ] Production: info
  - [ ] Development: debug
- [ ] Test logs appear correctly in Vercel logs

**Deliverable:** Structured logging throughout codebase.

---

### 4.5 TypeScript Improvements
- [ ] Enable strict mode in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true
    }
  }
  ```
- [ ] Create TypeScript interfaces in `types/index.ts`:
  - [ ] `Booking`
  - [ ] `ServiceArea`
  - [ ] `Promotion`
  - [ ] `SyncLog`
  - [ ] `MCPToolParams`
- [ ] Replace all `any` types with proper interfaces
- [ ] Add JSDoc comments for complex functions
- [ ] Fix all TypeScript errors
- [ ] Run `tsc --noEmit` to verify no errors

**Deliverable:** TypeScript strict mode enabled, no errors.

---

### 4.6 Widget Error Handling
- [ ] Add timeout to widget data fetching (5 seconds)
- [ ] Add retry logic (3 attempts with exponential backoff)
- [ ] Improve error messages:
  - [ ] "Loading data..." while fetching
  - [ ] "Could not load data. Please try again." on failure
  - [ ] Retry button on error
- [ ] Add fallback UI for missing data
- [ ] Test in slow network conditions
- [ ] Test with widget URL unreachable

**Deliverable:** Widgets handle errors gracefully.

---

### 4.7 Timezone Support
- [ ] Install `date-fns-tz`:
  ```bash
  npm install date-fns date-fns-tz
  ```
- [ ] Add timezone to service areas table (already in schema)
- [ ] Update scheduling logic:
  - [ ] Convert user request to service area timezone
  - [ ] Check if within business hours
  - [ ] Calculate "next available" in local time
- [ ] Display times in user's timezone in widgets
- [ ] Test with Nevada (Pacific) and Utah (Mountain) bookings

**Deliverable:** Scheduling respects timezones.

---

### 4.8 Unit Tests
- [ ] Install testing framework:
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  npm install --save-dev vitest @vitejs/plugin-react
  ```
- [ ] Configure Vitest in `vitest.config.ts`
- [ ] Write tests for MCP tools:
  - [ ] `checkServiceArea.test.ts`
    - [ ] Test exact city match
    - [ ] Test zip code match
    - [ ] Test partial city match
    - [ ] Test invalid location
    - [ ] Test zip code priority
  - [ ] `diagnoseIssue.test.ts`
    - [ ] Test emergency urgency
    - [ ] Test routine urgency
    - [ ] Test safety warnings
    - [ ] Test cost estimates
    - [ ] Test promotion application
  - [ ] `createServiceRequest.test.ts`
    - [ ] Test booking creation
    - [ ] Test confirmation number uniqueness
    - [ ] Test input validation
    - [ ] Test database save
- [ ] Write tests for validation schemas:
  - [ ] `validation.test.ts`
    - [ ] Test phone number validation
    - [ ] Test email validation
    - [ ] Test address validation
    - [ ] Test XSS prevention
- [ ] Run tests: `npm test`
- [ ] Aim for 80%+ coverage
- [ ] Set up CI to run tests on PR

**Deliverable:** 80%+ test coverage.

---

### 4.9 Load Testing
- [ ] Install load testing tool:
  ```bash
  npm install --save-dev artillery
  ```
- [ ] Create load test scenario in `artillery.yml`:
  - [ ] 100 virtual users
  - [ ] 10 requests per second
  - [ ] Mix of check_service_area, diagnose_issue, create_service_request
- [ ] Run load test against staging environment
- [ ] Monitor:
  - [ ] Response times (<500ms target)
  - [ ] Error rate (<0.1% target)
  - [ ] Database connections
  - [ ] Memory usage
- [ ] Optimize slow queries (add database indexes)
- [ ] Increase if needed: Vercel concurrency limit
- [ ] Re-run load test until passing

**Deliverable:** System handles 100 concurrent users.

---

### 4.10 Security Audit
- [ ] Run OWASP ZAP scan against MCP server
- [ ] Run OWASP ZAP scan against admin interface
- [ ] Review findings:
  - [ ] Fix all critical vulnerabilities
  - [ ] Fix all high vulnerabilities
  - [ ] Document medium/low (accept or fix)
- [ ] Test XSS prevention:
  - [ ] Attempt to inject `<script>` in all inputs
  - [ ] Verify blocked or escaped
- [ ] Test SQL injection:
  - [ ] Attempt `' OR 1=1--` in all inputs
  - [ ] Verify Prisma parameterizes queries
- [ ] Test authentication bypass:
  - [ ] Attempt to access admin without auth
  - [ ] Verify redirected to sign-in
- [ ] Review environment variable exposure:
  - [ ] Verify no secrets in client-side code
  - [ ] Verify no secrets in error messages
- [ ] Document security posture in `docs/SECURITY.md`

**Deliverable:** No critical/high vulnerabilities.

---

## Phase 5: Analytics & Optimization (Week 4+)

### 5.1 Analytics Dashboard
- [ ] Create `admin/app/(dashboard)/analytics/page.tsx`
- [ ] Install charting library (Recharts already installed)
- [ ] Build key metrics section:
  - [ ] Total bookings (all time, this month, this week)
  - [ ] Conversion rate (area checks → bookings)
  - [ ] Average cost estimate
  - [ ] Most common issues
- [ ] Build charts:
  - [ ] Bookings over time (line chart)
  - [ ] Service type distribution (pie chart)
  - [ ] Urgency levels (bar chart)
  - [ ] Top service areas (bar chart)
- [ ] Add time period selector (Today, 7 days, 30 days, Custom)
- [ ] Add export to CSV button
- [ ] Cache analytics queries (Redis)

**Deliverable:** Analytics dashboard with KPIs.

---

### 5.2 Email Confirmations
- [ ] Create Resend account (if not already)
- [ ] Design email templates:
  - [ ] Booking confirmation
  - [ ] Appointment reminder (24h before)
  - [ ] Appointment cancelled
- [ ] Create email sending function in `lib/email.ts`
- [ ] Send confirmation email after booking creation
- [ ] Add unsubscribe link (compliance)
- [ ] Test emails in staging
- [ ] Monitor email delivery rate

**Deliverable:** Email confirmations sent to customers.

---

### 5.3 SMS Confirmations
- [ ] Create Twilio account
- [ ] Add Twilio credentials to environment
- [ ] Create SMS sending function in `lib/sms.ts`
- [ ] Send SMS confirmation after booking:
  - [ ] "Your garage door service is confirmed for [time]. Confirmation #[number]."
- [ ] Send SMS reminder 2 hours before (optional)
- [ ] Add opt-out handling (STOP keyword)
- [ ] Test SMS in staging
- [ ] Monitor SMS delivery rate

**Deliverable:** SMS confirmations sent to customers.

---

### 5.4 Performance Optimization
- [ ] Audit database queries:
  - [ ] Add missing indexes
  - [ ] Optimize N+1 queries
  - [ ] Use Prisma select to fetch only needed fields
- [ ] Enable Vercel Edge Functions for MCP server
- [ ] Add CDN for widget assets (Vercel Edge Network)
- [ ] Minify widget JavaScript
- [ ] Compress widget HTML
- [ ] Enable gzip compression
- [ ] Add cache headers for static assets
- [ ] Monitor Core Web Vitals:
  - [ ] TTFB <200ms
  - [ ] FCP <1s
  - [ ] LCP <2.5s
- [ ] Run Lighthouse audit → score >90

**Deliverable:** <200ms response time, >90 Lighthouse score.

---

### 5.5 A/B Testing (Optional)
- [ ] Install A/B testing library:
  ```bash
  npm install @vercel/flags
  ```
- [ ] Create feature flags for widget variants:
  - [ ] Widget color scheme (blue vs green)
  - [ ] CTA button text ("Call Now" vs "Get Help Now")
  - [ ] Promotion badge style
- [ ] Track variant performance in analytics
- [ ] Run experiments for 2 weeks
- [ ] Choose winning variant
- [ ] Roll out to 100%

**Deliverable:** A/B testing framework in place.

---

## Post-Launch Checklist

### Monitoring Setup
- [ ] Set up Sentry alerts:
  - [ ] Error rate >1%
  - [ ] Response time >1s
  - [ ] Database connection errors
- [ ] Set up Vercel alerts:
  - [ ] Function timeouts
  - [ ] High memory usage
  - [ ] 5xx error rate >0.5%
- [ ] Set up Upstash alerts:
  - [ ] Rate limit hit rate >10%
- [ ] Set up custom alerts:
  - [ ] Service Titan sync failure rate >5%
  - [ ] Daily booking count <1 (potential issue)

### Documentation
- [ ] Write admin user guide:
  - [ ] How to view bookings
  - [ ] How to sync to Service Titan
  - [ ] How to add service areas
  - [ ] How to create promotions
- [ ] Write troubleshooting guide:
  - [ ] What to do if sync fails
  - [ ] How to manually create job in ST
  - [ ] Common error messages
- [ ] Document API endpoints (OpenAPI spec)
- [ ] Create runbook for common issues

### Training
- [ ] Train office staff on admin interface
- [ ] Create video walkthrough
- [ ] Set up support channel (Slack/email)
- [ ] Schedule weekly check-in for first month

### Launch
- [ ] Submit MCP app to OpenAI for review
- [ ] Announce to customers (social media, website)
- [ ] Monitor closely for first 48 hours
- [ ] Fix any issues immediately
- [ ] Collect user feedback

---

## Success Metrics Dashboard

Track these metrics weekly:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Booking Capture Rate | 100% | - | 🔴 |
| Service Titan Sync Rate | >95% | - | 🔴 |
| Error Rate | <0.1% | - | 🔴 |
| Response Time | <500ms | - | 🔴 |
| Admin User Adoption | >80% | - | 🔴 |
| Weekly Bookings | >10 | - | 🔴 |
| Customer Satisfaction | >4.5/5 | - | 🔴 |

🟢 = On track | 🟡 = At risk | 🔴 = Not started / Off track

---

## Notes

- **Blockers:** Service Titan API credentials needed for Phase 3
- **Dependencies:** Phase 2 depends on Phase 1 completion
- **Timeline:** Estimated 4 weeks total (assumes full-time development)
- **Resources:** 1 developer, access to A Plus Service Titan account
- **Risks:** Service Titan API availability, widget performance in ChatGPT

---

**Last Updated:** January 7, 2026
**Next Review:** After Phase 1 completion
