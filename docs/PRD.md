# Product Requirements Document (PRD)
## A Plus Garage Door - ChatGPT MCP Server v2.0

**Version:** 2.0
**Date:** January 7, 2026
**Status:** Planning
**Owner:** Seth Shoultes

---

## Executive Summary

The A Plus Garage Door ChatGPT MCP Server enables customers to check service coverage, diagnose garage door issues, and book appointments directly within ChatGPT conversations. This PRD outlines the migration from a proof-of-concept to a production-ready system with:

- **Database persistence** for all customer bookings
- **Service Titan API integration** for automated job creation
- **Admin interface** for non-technical staff to manage service areas, promotions, and bookings
- **Security hardening** to prevent data breaches and abuse
- **Production monitoring** for reliability and analytics

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Goals & Success Metrics](#goals--success-metrics)
3. [User Personas](#user-personas)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Admin Interface Design](#admin-interface-design)
7. [Technical Requirements](#technical-requirements)
8. [Security Requirements](#security-requirements)
9. [Implementation Phases](#implementation-phases)
10. [Open Questions](#open-questions)
11. [Risks & Mitigations](#risks--mitigations)

---

## Problem Statement

### Current State
The MCP server is a working proof-of-concept with critical limitations:
- ❌ Bookings are **not saved** - customers receive fake confirmations
- ❌ **No Service Titan integration** - manual data entry required
- ❌ Service areas and promotions are **hardcoded** in JSON files
- ❌ **XSS vulnerabilities** in widget data injection
- ❌ **No input validation** - accepts malicious or malformed data
- ❌ **No admin interface** - developers required for any updates
- ❌ **No error monitoring** - production issues invisible

### Impact
- Lost leads when bookings aren't captured
- Security risk to customer data
- High operational overhead for simple updates
- Poor customer experience (fake confirmations)

---

## Goals & Success Metrics

### Primary Goals
1. **Capture 100% of booking requests** in database
2. **Automate Service Titan job creation** (95%+ success rate)
3. **Enable non-technical staff** to manage service areas and promotions
4. **Achieve production-grade security** (zero XSS/injection vulnerabilities)
5. **Monitor system health** with error tracking and analytics

### Success Metrics
- **Lead Capture Rate:** 100% of bookings saved to database
- **Service Titan Sync Rate:** >95% successful job creation
- **Response Time:** <500ms for MCP tool calls
- **Admin User Adoption:** Office staff can update promotions without developer
- **Error Rate:** <0.1% of requests result in errors
- **Customer Satisfaction:** Booking confirmations match actual scheduled appointments

---

## User Personas

### 1. End Customer (ChatGPT User)
**Role:** Homeowner with garage door issue
**Goals:**
- Check if A Plus services their area
- Get cost estimate for their problem
- Book an appointment quickly

**Pain Points:**
- Needs immediate help (emergency scenarios)
- Doesn't want to call during business hours
- Wants transparency on pricing

### 2. Office Staff / Dispatcher
**Role:** A Plus employee managing bookings
**Goals:**
- View all ChatGPT-generated bookings
- Sync bookings to Service Titan
- Update service areas when expanding coverage
- Manage seasonal promotions

**Pain Points:**
- Not technical - can't edit code or JSON files
- Needs to see booking status at a glance
- Must handle failed Service Titan syncs

### 3. Marketing Manager
**Role:** Creates promotions and campaigns
**Goals:**
- Launch time-limited promotions
- Update pricing estimates
- Track which promotions convert best

**Pain Points:**
- Can't wait for developer to update promo codes
- Needs analytics on booking sources
- Wants A/B testing capabilities

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChatGPT User                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ MCP Protocol (HTTPS)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server (Vercel)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ check_       │  │ diagnose_    │  │ create_      │          │
│  │ service_area │  │ issue        │  │ service_req  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                     │
│                 ┌──────────────────────┐                         │
│                 │  Input Validation    │                         │
│                 │  (Zod Schemas)       │                         │
│                 └──────────┬───────────┘                         │
│                            ▼                                     │
│                 ┌──────────────────────┐                         │
│                 │  Vercel Postgres DB  │                         │
│                 │  - bookings          │                         │
│                 │  - service_areas     │                         │
│                 │  - promotions        │                         │
│                 └──────────┬───────────┘                         │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │  Job Queue           │
                 │  (Inngest/Vercel)    │
                 └──────────┬───────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │  Service Titan API   │
                 │  - Create Job        │
                 │  - Get Availability  │
                 └──────────────────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │  Webhooks            │
                 │  (Status Updates)    │
                 └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Admin Interface (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Bookings     │  │ Service      │  │ Promotions   │          │
│  │ Dashboard    │  │ Areas CRUD   │  │ CRUD         │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ ST Sync      │  │ Analytics    │                            │
│  │ Manual Queue │  │ Dashboard    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**MCP Server:**
- Runtime: Node.js 20+ (Vercel Serverless)
- Framework: Express + @modelcontextprotocol/sdk
- Language: TypeScript 5.9
- Validation: Zod 3.x
- Database: Vercel Postgres (PostgreSQL 15)
- ORM: Prisma 5.x
- Job Queue: Inngest
- Error Monitoring: Sentry
- Rate Limiting: Upstash Redis

**Admin Interface:**
- Framework: Next.js 15 (App Router)
- UI Components: shadcn/ui + Tailwind CSS
- Forms: React Hook Form + Zod
- Auth: Clerk
- Charts: Recharts
- Date Handling: date-fns

**Widgets:**
- Build Tool: Vite 6
- Framework: React 18
- Styling: Tailwind CSS v4

---

## Database Schema

### Tables

#### `bookings`
Stores all customer booking requests from ChatGPT.

```sql
CREATE TABLE bookings (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_number VARCHAR(20) UNIQUE NOT NULL,

  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),

  -- Service Details
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN (
    'emergency_repair',
    'standard_repair',
    'installation',
    'maintenance'
  )),
  issue_summary TEXT,
  symptoms JSONB,
  urgency VARCHAR(20) CHECK (urgency IN ('emergency', 'soon', 'routine')),

  -- Pricing
  estimated_cost_min INTEGER,
  estimated_cost_max INTEGER,
  promotion_code VARCHAR(50),
  discount_amount DECIMAL(10, 2),

  -- Scheduling
  requested_time_window VARCHAR(100),
  scheduled_for TIMESTAMP WITH TIME ZONE,

  -- Service Titan Integration
  service_titan_job_id VARCHAR(100),
  service_titan_customer_id VARCHAR(100),
  service_titan_location_id VARCHAR(100),
  st_sync_status VARCHAR(50) DEFAULT 'pending' CHECK (st_sync_status IN (
    'pending',
    'syncing',
    'synced',
    'failed',
    'manual'
  )),
  st_sync_error TEXT,
  st_sync_attempts INTEGER DEFAULT 0,
  st_synced_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
  )),

  -- Metadata
  mcp_session_id VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_number);
CREATE INDEX idx_bookings_phone ON bookings(phone);
CREATE INDEX idx_bookings_st_sync_status ON bookings(st_sync_status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_service_titan_job_id ON bookings(service_titan_job_id);
```

#### `service_areas`
Dynamic service coverage areas (replaces hardcoded JSON).

```sql
CREATE TABLE service_areas (
  -- Identity
  id SERIAL PRIMARY KEY,

  -- Location Details
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('city', 'suburb', 'neighborhood', 'county')),
  state VARCHAR(50) NOT NULL,
  zip_prefixes TEXT[] NOT NULL,

  -- Contact
  phone VARCHAR(20) NOT NULL,
  timezone VARCHAR(50) NOT NULL,

  -- Coordinates (for distance calculations)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Priority & Status
  priority INTEGER DEFAULT 0, -- Higher priority wins for overlapping zips
  is_active BOOLEAN DEFAULT true,

  -- Emergency Service
  emergency_available BOOLEAN DEFAULT true,
  emergency_hours VARCHAR(100) DEFAULT '24/7',

  -- Metadata
  notes TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_service_areas_state ON service_areas(state);
CREATE INDEX idx_service_areas_is_active ON service_areas(is_active);
CREATE INDEX idx_service_areas_priority ON service_areas(priority DESC);
CREATE INDEX idx_service_areas_zip_prefixes ON service_areas USING GIN(zip_prefixes);
```

#### `promotions`
Dynamic promotion codes and discounts.

```sql
CREATE TABLE promotions (
  -- Identity
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Discount
  discount_type VARCHAR(20) CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value DECIMAL(10, 2) NOT NULL,

  -- Applicability
  applies_to TEXT[] NOT NULL, -- ['spring_repair', 'installation', etc.]
  min_service_cost DECIMAL(10, 2),

  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Usage Limits
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,

  -- Display
  display_priority INTEGER DEFAULT 0,
  badge_text VARCHAR(50), -- "BEST VALUE", "LIMITED TIME", etc.

  -- Metadata
  notes TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_valid_dates ON promotions(valid_from, valid_until);
```

#### `sync_logs`
Audit trail for Service Titan sync operations.

```sql
CREATE TABLE sync_logs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Sync Details
  sync_type VARCHAR(50) CHECK (sync_type IN ('manual', 'automatic', 'retry')),
  status VARCHAR(50) CHECK (status IN ('started', 'success', 'failed')),

  -- Request/Response
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,

  -- Metadata
  triggered_by VARCHAR(100), -- User email or 'system'
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_sync_logs_booking_id ON sync_logs(booking_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);
```

#### `admin_users`
Admin interface access control.

```sql
CREATE TABLE admin_users (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(100) UNIQUE NOT NULL,

  -- User Info
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),

  -- Role
  role VARCHAR(50) CHECK (role IN ('admin', 'dispatcher', 'viewer')),

  -- Permissions
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_users_clerk_id ON admin_users(clerk_user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
```

---

## Admin Interface Design

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│  A Plus Admin                              👤 Seth ▼        │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard                                                │
│  📋 Bookings                                                 │
│  📍 Service Areas                                            │
│  🎟️  Promotions                                              │
│  🔄 Service Titan Sync                                       │
│  📈 Analytics                                                │
│  ⚙️  Settings                                                │
└─────────────────────────────────────────────────────────────┘
```

### Page Specifications

#### 1. Dashboard (`/admin/dashboard`)

**Purpose:** At-a-glance view of system health and recent activity.

**Components:**
- **Stats Cards** (4 across):
  - Total Bookings Today
  - Pending ST Sync (with warning badge if >5)
  - Revenue Estimate Today
  - Active Promotions

- **Recent Bookings Table** (last 10):
  - Columns: Time, Customer, Phone, Issue, Status, ST Sync, Actions
  - Quick actions: View, Sync to ST, Call Customer

- **Service Titan Sync Status** (widget):
  - Success rate (last 24h)
  - Failed syncs (clickable to retry)
  - Queue depth

- **Coverage Map** (optional Phase 2):
  - Visual map of service areas
  - Click area to see stats

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 12       │ │ 3        │ │ $3,450   │ │ 5        │      │
│  │ Bookings │ │ Pending  │ │ Revenue  │ │ Promos   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  Recent Bookings                         [View All →]       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Time  │ Customer      │ Issue        │ Status  │ ST  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 2:34p │ John Smith    │ Won't close  │ Pending │ ❌  │  │
│  │ 1:15p │ Jane Doe      │ Grinding     │ Synced  │ ✅  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Service Titan Sync                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Success Rate: 94% (47/50)                            │  │
│  │ Failed: 3 [Retry All]                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. Bookings (`/admin/bookings`)

**Purpose:** View, search, and manage all bookings.

**Features:**
- **Filters:**
  - Date range picker
  - Status (Pending, Confirmed, Scheduled, Completed, Cancelled)
  - ST Sync Status (Pending, Synced, Failed)
  - Service Type
  - Search by customer name/phone/confirmation number

- **Table Columns:**
  - Confirmation #
  - Date/Time
  - Customer Name
  - Phone (clickable to call)
  - Service Type
  - Issue Summary (truncated, hover for full)
  - Urgency (badge: 🚨 Emergency, ⚡ Soon, ℹ️ Routine)
  - Estimated Cost
  - ST Sync Status
  - Actions

- **Row Actions:**
  - 👁️ View Details (modal)
  - 🔄 Sync to ST (if pending/failed)
  - 📞 Call Customer
  - ✏️ Edit
  - ❌ Cancel

- **Bulk Actions:**
  - Select multiple → Sync to ST
  - Select multiple → Export to CSV

**Detail Modal:**
```
┌─────────────────────────────────────────────────────────────┐
│  Booking Details - APG-742561                         [✕]   │
├─────────────────────────────────────────────────────────────┤
│  Customer Information                                        │
│  Name:     John Smith                                        │
│  Phone:    (702) 555-1234                    [📞 Call]      │
│  Email:    john@example.com                  [✉️ Email]      │
│  Address:  123 Main St, Henderson, NV 89015                 │
│                                                              │
│  Service Details                                             │
│  Type:         Emergency Repair                              │
│  Urgency:      🚨 Emergency                                  │
│  Symptoms:     • Won't close                                 │
│                • Stuck open                                  │
│  Issue:        Broken spring likely                          │
│  Estimate:     $150 - $350                                   │
│  Requested:    ASAP (Next 1-2 hours)                         │
│                                                              │
│  Service Titan Status                                        │
│  Job ID:       [Not synced yet]                              │
│  Status:       ❌ Pending                                    │
│  Last Attempt: Never                                         │
│                                                              │
│  [🔄 Sync to Service Titan]  [✏️ Edit]  [❌ Cancel Booking] │
└─────────────────────────────────────────────────────────────┘
```

---

#### 3. Service Areas (`/admin/service-areas`)

**Purpose:** Manage service coverage areas.

**Features:**
- **List View:**
  - Table: Name, State, Zip Prefixes, Phone, Priority, Active, Actions
  - Sort by priority, name, state
  - Filter by state, active status

- **Add New Area:** Button → Form modal

- **Edit Area:** Pencil icon → Form modal

- **Form Fields:**
  - Name (text)
  - Type (dropdown: City, Suburb, Neighborhood, County)
  - State (dropdown: Nevada, Utah)
  - Zip Prefixes (tag input: "891", "890", etc.)
  - Phone (formatted input)
  - Timezone (dropdown: America/Los_Angeles, America/Denver)
  - Priority (number, higher = preferred for overlapping zips)
  - Emergency Available (checkbox)
  - Emergency Hours (text)
  - Coordinates (optional: lat/lng)
  - Active (toggle)
  - Notes (textarea)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Service Areas                           [+ Add New Area]   │
├─────────────────────────────────────────────────────────────┤
│  [Nevada ▼] [All Status ▼]                      [Search...] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Name         │ State │ Zips     │ Phone        │ ⚡  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Las Vegas    │ NV    │ 891      │ (702)297-7811│ ✅  │  │
│  │ Henderson    │ NV    │ 890      │ (702)297-7811│ ✅  │  │
│  │ Salt Lake... │ UT    │ 841, 842 │ (801)683-6222│ ✅  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 4. Promotions (`/admin/promotions`)

**Purpose:** Create and manage promotional offers.

**Features:**
- **List View:**
  - Card grid or table view toggle
  - Filters: Active, Expired, Upcoming
  - Sort: Priority, Valid From, Valid Until

- **Promotion Card:**
  - Code badge
  - Title
  - Discount amount
  - Valid dates
  - Usage: 15/100 uses (progress bar)
  - Active toggle (quick enable/disable)
  - Edit/Delete actions

- **Add/Edit Form:**
  - Code (text, auto-uppercase)
  - Title (text)
  - Description (textarea)
  - Discount Type (radio: Fixed $ / Percentage %)
  - Discount Value (number)
  - Applies To (multi-select: Spring Repair, Installation, etc.)
  - Min Service Cost (number, optional)
  - Valid From (date picker)
  - Valid Until (date picker)
  - Max Uses (number, optional)
  - Display Priority (number)
  - Badge Text (text, optional: "BEST VALUE")
  - Active (toggle)
  - Notes (textarea)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Promotions                            [+ Create Promotion] │
├─────────────────────────────────────────────────────────────┤
│  [Active ▼] [🔲 Card View] [≡ Table View]   [Search...]    │
│                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│  │ SPRING75        │ │ NEWYEAR         │ │ WINTER50     │ │
│  │ $75 OFF         │ │ 20% OFF         │ │ $50 OFF      │ │
│  │ Spring Repair   │ │ All Services    │ │ Winterize    │ │
│  │                 │ │                 │ │              │ │
│  │ Valid until     │ │ Valid until     │ │ Expired      │ │
│  │ Mar 31, 2026    │ │ Jan 31, 2026    │ │ Dec 31, 2025 │ │
│  │                 │ │                 │ │              │ │
│  │ 34/100 uses     │ │ 12/50 uses      │ │ 45/100 uses  │ │
│  │ ████░░░░░░      │ │ ████░░░░░░      │ │ █████████░   │ │
│  │                 │ │                 │ │              │ │
│  │ [✓ Active]      │ │ [✓ Active]      │ │ [✕ Inactive] │ │
│  │ [✏️ Edit] [🗑️]  │ │ [✏️ Edit] [🗑️]  │ │ [✏️ Edit] [🗑️]│ │
│  └─────────────────┘ └─────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

#### 5. Service Titan Sync (`/admin/sync`)

**Purpose:** Monitor and manually trigger Service Titan synchronization.

**Features:**
- **Auto-Sync Status:**
  - Toggle to enable/disable automatic sync
  - Current status indicator
  - Next sync time

- **Manual Sync Queue:**
  - List of pending/failed bookings
  - Bulk select → Sync Now
  - Individual retry button
  - Error details (expandable)

- **Sync History:**
  - Table of recent sync attempts
  - Columns: Time, Booking, Status, Duration, Error, Triggered By
  - Filter by status, date range
  - Search by booking confirmation

- **Settings:**
  - Service Titan API credentials (masked)
  - Test connection button
  - Retry configuration (max attempts, backoff)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Service Titan Sync                                          │
├─────────────────────────────────────────────────────────────┤
│  Automatic Sync:  [✓ Enabled]                               │
│  Status:          ✅ Running normally                        │
│  Last Run:        2 minutes ago                              │
│  Next Run:        In 58 seconds                              │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  Pending Sync (3 bookings)          [🔄 Sync All Selected] │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ☐ │ APG-742561 │ John Smith    │ 5 min ago │ Failed │  │
│  │ ☐ │ APG-742562 │ Jane Doe      │ 12 min    │ Pending│  │
│  │ ☐ │ APG-742563 │ Bob Johnson   │ 1 hour    │ Failed │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Sync History (Last 24 hours)                [View All →]  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Time   │ Booking    │ Status  │ Duration │ User      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 2:40pm │ APG-742560 │ ✅ OK   │ 1.2s     │ Auto      │  │
│  │ 2:35pm │ APG-742561 │ ❌ Fail │ 5.0s     │ Auto      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

#### 6. Analytics (`/admin/analytics`)

**Purpose:** Business intelligence and performance metrics.

**Features (Phase 2):**
- **Time Period Selector:** Today, Last 7 Days, Last 30 Days, Custom Range
- **Key Metrics:**
  - Total Bookings
  - Conversion Rate (bookings/service area checks)
  - Average Cost Estimate
  - Most Common Issues
  - Peak Hours (heatmap)
  - Promotion Effectiveness
- **Charts:**
  - Bookings over time (line chart)
  - Service type distribution (pie chart)
  - Urgency levels (bar chart)
  - Geographic distribution (map)

---

#### 7. Settings (`/admin/settings`)

**Purpose:** System configuration and API credentials.

**Sections:**

**API Keys:**
- Service Titan API Key (masked input, test button)
- Service Titan Tenant ID
- Sentry DSN
- Upstash Redis URL

**Contact Information:**
- Nevada Phone Number
- Utah Phone Number
- Support Email
- Emergency Hours

**Business Hours:**
- Monday-Friday hours
- Saturday-Sunday hours
- Holiday schedule

**Notifications:**
- Email alerts for failed syncs
- Slack webhook for new emergency bookings
- SMS alerts threshold

**User Management:**
- Add/remove admin users
- Assign roles
- View audit log

---

## Technical Requirements

### Input Validation

All user inputs must be validated using Zod schemas:

```typescript
// Customer name
z.string()
  .min(2, "Name must be at least 2 characters")
  .max(255, "Name too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name")

// Phone number
z.string()
  .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    "Invalid phone format")
  .transform(phone => phone.replace(/\D/g, '')) // Strip formatting

// Email (optional)
z.string()
  .email("Invalid email format")
  .optional()

// Address
z.string()
  .min(10, "Address too short")
  .max(500, "Address too long")

// Symptoms
z.array(z.string().max(200))
  .min(1, "At least one symptom required")
  .max(10, "Too many symptoms")

// Service type
z.enum(['emergency_repair', 'standard_repair', 'installation', 'maintenance'])
```

### XSS Prevention

**Current Vulnerability:**
```typescript
// ❌ DANGEROUS
widgetHtml = widgetHtml.replace(
  '</head>',
  `<script>window.__TOOL_OUTPUT__ = ${JSON.stringify(result)};</script></head>`
);
```

**Secure Implementation:**
```typescript
// ✅ SAFE
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Or use DOMPurify
import DOMPurify from 'isomorphic-dompurify';

const safeJson = DOMPurify.sanitize(JSON.stringify(result));
widgetHtml = widgetHtml.replace(
  '</head>',
  `<script>window.__TOOL_OUTPUT__ = ${safeJson};</script></head>`
);
```

### Rate Limiting

**Implementation with Upstash Redis:**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const identifier = req.headers['x-forwarded-for'] || 'anonymous';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return res.status(429).json({
      error: "Too many requests. Please try again later."
    });
  }

  // Continue with request...
}
```

### Error Monitoring

**Sentry Integration:**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

try {
  // MCP tool execution
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      tool_name: name,
      session_id: req.headers['x-mcp-session-id']
    },
    extra: {
      tool_args: toolArgs,
      user_input: req.body
    }
  });

  throw error;
}
```

### Logging

**Replace console.log with structured logging:**

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Usage
logger.info({ tool: 'check_service_area', location: 'Henderson' }, 'Tool executed');
logger.error({ error: err, booking_id: id }, 'Service Titan sync failed');
```

---

## Security Requirements

### 1. Authentication & Authorization

**Admin Interface:**
- Clerk for authentication (OAuth + email/password)
- Role-based access control (RBAC):
  - **Admin:** Full access
  - **Dispatcher:** View/edit bookings, manual ST sync
  - **Viewer:** Read-only access
- Session timeout: 8 hours
- MFA required for admin role

**MCP Server:**
- No authentication (ChatGPT handles user identity)
- Rate limiting per IP
- CORS restricted to OpenAI domains

### 2. Data Protection

**PII Encryption:**
- Customer phone/email/address encrypted at rest
- Use Prisma middleware for transparent encryption
- Encryption keys in Vercel environment variables

**Compliance:**
- GDPR: Data retention policy (delete after 2 years)
- CCPA: Customer data export/deletion on request
- Terms of service acceptance stored in metadata

### 3. API Security

**Service Titan API:**
- API keys stored in Vercel environment variables
- Never expose in client-side code or logs
- Rotate keys every 90 days
- Use separate keys for production/staging

**Rate Limiting:**
- Per IP: 10 req/min for MCP tools
- Per booking: 3 ST sync retries max
- Global: 1000 req/hour

### 4. Input Sanitization

- All inputs validated with Zod
- SQL injection: Use Prisma ORM (parameterized queries)
- XSS: Escape HTML entities
- Path traversal: Validate file paths
- Command injection: No shell commands with user input

---

## Implementation Phases

### Phase 1: Database & Core Security (Week 1)
**Goal:** Stop the bleeding - no more fake bookings, secure the system.

**Tasks:**
1. ✅ Set up Vercel Postgres
2. ✅ Create database schema (Prisma migrations)
3. ✅ Migrate service-areas-data.json to database
4. ✅ Add Zod validation schemas
5. ✅ Fix XSS vulnerability (HTML escape)
6. ✅ Replace Date.now() with crypto.randomUUID()
7. ✅ Update MCP server to save bookings to DB
8. ✅ Add environment variables
9. ✅ Deploy to production

**Deliverables:**
- Working database with all tables
- MCP server saves 100% of bookings
- No XSS vulnerabilities
- Environment-based configuration

**Testing:**
- Create 10 test bookings via MCPJam
- Verify all save to database
- Attempt XSS attack → blocked
- Check confirmation numbers are unique

---

### Phase 2: Admin Interface MVP (Week 2)
**Goal:** Enable office staff to view bookings and manually sync to Service Titan.

**Tasks:**
1. ✅ Set up Next.js admin app
2. ✅ Configure Clerk authentication
3. ✅ Build dashboard page (stats + recent bookings)
4. ✅ Build bookings page (table, filters, search)
5. ✅ Build booking detail modal
6. ✅ Add "Sync to Service Titan" button (manual)
7. ✅ Build service areas CRUD
8. ✅ Build promotions CRUD
9. ✅ Deploy admin app to Vercel

**Deliverables:**
- Admin interface accessible at admin.aplus-garage-door.com
- Office staff can view all bookings
- Manual sync button triggers ST API call
- CRUD for service areas and promotions

**Testing:**
- Create test booking via ChatGPT
- View in admin interface
- Click "Sync to ST" → verify job created in Service Titan
- Add new service area → verify MCP recognizes it
- Create promotion → verify applied in diagnosis widget

---

### Phase 3: Service Titan Integration (Week 2-3)
**Goal:** Automate job creation in Service Titan.

**Tasks:**
1. ✅ Get Service Titan API credentials
2. ✅ Create Service Titan API client module
3. ✅ Implement job creation endpoint
4. ✅ Set up Inngest job queue
5. ✅ Add automatic sync trigger (on booking creation)
6. ✅ Build retry logic (exponential backoff)
7. ✅ Add webhook handler for ST status updates
8. ✅ Build sync logs table and UI
9. ✅ Add failed sync alerts (email/Slack)

**Deliverables:**
- Bookings automatically create ST jobs
- Failed syncs retry 3 times
- Admin dashboard shows sync status
- Alerts sent for persistent failures

**Testing:**
- Create emergency booking → ST job created in <1 min
- Simulate ST API failure → verify retry logic
- Check webhook updates booking status
- Verify failed sync appears in admin queue

---

### Phase 4: Polish & Production Readiness (Week 3-4)
**Goal:** Production-grade monitoring, performance, and UX.

**Tasks:**
1. ✅ Add Sentry error monitoring
2. ✅ Fix zip code overlap logic (priority handling)
3. ✅ Add Upstash rate limiting
4. ✅ Remove all console.log, add structured logging
5. ✅ Write TypeScript interfaces (remove `any`)
6. ✅ Add widget error handling (retry, timeout)
7. ✅ Implement timezone-aware scheduling
8. ✅ Write unit tests (80% coverage)
9. ✅ Load testing (simulate 1000 concurrent users)
10. ✅ Security audit (penetration testing)

**Deliverables:**
- Sentry dashboard with <0.1% error rate
- All TypeScript strict mode enabled
- 80%+ test coverage
- Load test passes at 1000 RPS
- Security audit report (no critical/high vulns)

**Testing:**
- Generate 1000 bookings via script
- Monitor Sentry for errors
- Run OWASP ZAP security scan
- Verify widgets load in <500ms

---

### Phase 5: Analytics & Optimization (Week 4+)
**Goal:** Business intelligence and continuous improvement.

**Tasks:**
1. ✅ Build analytics dashboard
2. ✅ Add conversion tracking (area check → booking)
3. ✅ Implement promotion effectiveness metrics
4. ✅ Add geographic heatmap
5. ✅ Build email confirmations (Resend)
6. ✅ Add SMS confirmations (Twilio)
7. ✅ A/B test widget layouts
8. ✅ Add customer feedback widget
9. ✅ Optimize database queries (indexes, caching)
10. ✅ CDN for widget assets

**Deliverables:**
- Analytics dashboard with KPIs
- Email/SMS confirmations
- Optimized performance (<200ms response time)
- A/B testing framework

---

## Open Questions

### Technical Questions
1. **Service Titan API Access:**
   - Do we have API credentials?
   - Which endpoints are available (create job, get availability, customer lookup)?
   - Rate limits on ST API?

2. **Email/SMS:**
   - Should we send booking confirmations?
   - Provider preference: Resend? SendGrid? Twilio?
   - Budget for transactional messages?

3. **Customer Portal:**
   - Do customers need to view/modify bookings?
   - Or is ChatGPT the only interface?

4. **Payment:**
   - Collect payment info at booking?
   - Or only on-site?

### Business Questions
1. **Admin Access:**
   - Who needs admin interface access?
   - Roles needed beyond admin/dispatcher/viewer?

2. **Booking Workflow:**
   - Auto-sync to ST or manual review first?
   - Approval required for emergency bookings?

3. **Service Areas:**
   - Any expansion plans we should design for?
   - Different pricing by area?

4. **Promotions:**
   - Who manages promotions (marketing vs dispatch)?
   - Approval workflow needed?

---

## Risks & Mitigations

### Risk 1: Service Titan API Downtime
**Impact:** Bookings captured but not synced → technicians don't know about jobs.

**Mitigation:**
- Queue all sync attempts
- Retry with exponential backoff
- Alert admin after 3 failed attempts
- Manual sync button in admin UI
- Fallback: Email booking details to dispatch

### Risk 2: Database Costs
**Impact:** Vercel Postgres free tier exceeded.

**Mitigation:**
- Monitor usage via Vercel dashboard
- Set up alerts at 80% of free tier
- Archive old bookings (>6 months) to cold storage
- Upgrade plan if needed (~$20/mo for Hobby)

### Risk 3: Widget Performance
**Impact:** Slow widget load = poor UX in ChatGPT.

**Mitigation:**
- Inline CSS (already done)
- Minify JavaScript
- Use CDN for assets (Vercel Edge Network)
- Monitor with Sentry performance tracking
- Target: <500ms TTFB

### Risk 4: XSS/Injection Attacks
**Impact:** Customer data compromised, reputational damage.

**Mitigation:**
- All inputs validated with Zod
- HTML entities escaped
- Security audit before launch
- Regular penetration testing
- Bug bounty program (optional)

### Risk 5: Admin Interface Unauthorized Access
**Impact:** Competitor or malicious actor accesses customer data.

**Mitigation:**
- Clerk authentication with MFA
- IP whitelisting (optional)
- Audit log of all admin actions
- Session timeouts
- Alerts for suspicious activity

### Risk 6: ChatGPT App Rejection
**Impact:** OpenAI rejects MCP app due to policy violations.

**Mitigation:**
- Review OpenAI MCP guidelines
- Add terms of service acceptance
- Clear privacy policy
- Test with OpenAI sandbox before submission
- Responsive support channel

---

## Success Criteria

### Launch Criteria (Must-Have)
- ✅ 100% of bookings saved to database
- ✅ Service Titan integration working (>95% success rate)
- ✅ Admin interface accessible to office staff
- ✅ No XSS or injection vulnerabilities
- ✅ Input validation on all fields
- ✅ Error monitoring active (Sentry)
- ✅ Rate limiting enabled
- ✅ HTTPS everywhere
- ✅ Backup/restore procedure tested

### 30-Day Success Metrics
- 90%+ booking capture rate (no lost data)
- 95%+ Service Titan sync success
- <0.1% error rate
- <500ms average response time
- 0 security incidents
- Admin user adoption (weekly active users)
- 10+ bookings per week via ChatGPT

### 90-Day Success Metrics
- 50+ bookings via ChatGPT
- 5+ service areas actively served
- 3+ active promotions
- Analytics dashboard used weekly
- Customer satisfaction >4.5/5
- ROI positive (ChatGPT bookings vs development cost)

---

## Appendix

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Service Titan
SERVICE_TITAN_API_KEY=sk_live_...
SERVICE_TITAN_TENANT_ID=...
SERVICE_TITAN_API_URL=https://api.servicetitan.io/v2

# Widget URLs
NEXT_PUBLIC_WIDGET_BASE_URL=https://aplus-garage-door-chatgpt-app.vercel.app/dist/widgets

# Admin
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Notifications (optional)
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Other
NODE_ENV=production
LOG_LEVEL=info
```

### Technology Evaluation

| Technology | Chosen | Alternatives Considered | Rationale |
|------------|--------|------------------------|-----------|
| Database | Vercel Postgres | Supabase, PlanetScale | Integrated with Vercel, generous free tier |
| ORM | Prisma | Drizzle, TypeORM | Best TypeScript support, great DX |
| Admin Auth | Clerk | Auth0, NextAuth | Easy MFA, good UX, fair pricing |
| Job Queue | Inngest | BullMQ, Vercel Cron | Serverless-native, built-in retries |
| Error Monitoring | Sentry | LogRocket, Datadog | Industry standard, free tier |
| Rate Limiting | Upstash Redis | Cloudflare, Vercel Edge | Serverless Redis, pay-as-you-go |
| Email | Resend | SendGrid, Postmark | Developer-friendly API, fair pricing |
| SMS | Twilio | AWS SNS, Vonage | Reliable, good docs |

### Prisma Schema

See separate file: `prisma/schema.prisma` (to be created in Phase 1)

### API Endpoints

**MCP Server (`/api/mcp`):**
- POST `/api/mcp` - MCP protocol handler

**Admin API (`/api/admin/...`):**
- GET `/api/admin/bookings` - List bookings
- GET `/api/admin/bookings/:id` - Get booking
- PATCH `/api/admin/bookings/:id` - Update booking
- POST `/api/admin/bookings/:id/sync` - Sync to Service Titan
- GET `/api/admin/service-areas` - List service areas
- POST `/api/admin/service-areas` - Create service area
- PATCH `/api/admin/service-areas/:id` - Update service area
- DELETE `/api/admin/service-areas/:id` - Delete service area
- GET `/api/admin/promotions` - List promotions
- POST `/api/admin/promotions` - Create promotion
- PATCH `/api/admin/promotions/:id` - Update promotion
- DELETE `/api/admin/promotions/:id` - Delete promotion
- GET `/api/admin/analytics` - Get analytics data
- POST `/api/webhooks/servicetitan` - Service Titan webhook handler

---

**Document Version:** 1.0
**Last Updated:** January 7, 2026
**Next Review:** Phase 1 Completion
