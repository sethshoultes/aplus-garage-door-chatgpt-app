# ServiceTitan API Research
**Date:** January 7, 2026
**Status:** Pending API Credentials

---

## API Documentation

**Official Portal:** https://developer.servicetitan.io

### Authentication
- **Method:** OAuth 2.0
- **Documentation:** https://developer.servicetitan.io/docs/oauth20
- **Required Credentials:**
  - Client ID
  - Client Secret
  - Tenant ID
  - App Key (for some endpoints)

### API Structure
ServiceTitan uses a RESTful API with versioned endpoints (currently V2).

**Base URL:** `https://api.servicetitan.io/v2/tenant/{tenant-id}/`

---

## Required Endpoints for Our Integration

Based on the PRD requirements, we need access to these endpoints:

### 1. Jobs API
**Purpose:** Create service jobs from ChatGPT bookings

**Likely Endpoints:**
```
POST /jpm/v2/tenant/{tenant-id}/jobs
GET /jpm/v2/tenant/{tenant-id}/jobs/{id}
PATCH /jpm/v2/tenant/{tenant-id}/jobs/{id}
DELETE /jpm/v2/tenant/{tenant-id}/jobs/{id}
```

**Request Payload (estimated):**
```json
{
  "customerId": "string",
  "locationId": "string",
  "jobTypeId": "string",
  "businessUnitId": "string",
  "priority": "Normal" | "High" | "Emergency",
  "summary": "string",
  "description": "string",
  "scheduledStart": "2026-01-07T10:00:00Z",
  "scheduledEnd": "2026-01-07T12:00:00Z"
}
```

**Response:**
```json
{
  "id": "string",
  "jobNumber": "string",
  "status": "string",
  "createdOn": "2026-01-07T09:00:00Z"
}
```

### 2. Customers API
**Purpose:** Create/lookup customers before creating jobs

**Likely Endpoints:**
```
POST /crm/v2/tenant/{tenant-id}/customers
GET /crm/v2/tenant/{tenant-id}/customers/{id}
GET /crm/v2/tenant/{tenant-id}/customers?phone={phone}
PATCH /crm/v2/tenant/{tenant-id}/customers/{id}
```

**Request Payload (estimated):**
```json
{
  "name": "string",
  "type": "Residential" | "Commercial",
  "phoneNumbers": [
    {
      "type": "Mobile",
      "number": "7025551234"
    }
  ],
  "email": "customer@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Henderson",
    "state": "NV",
    "zip": "89015",
    "country": "USA"
  }
}
```

### 3. Locations API
**Purpose:** Associate service locations with customers

**Likely Endpoints:**
```
POST /crm/v2/tenant/{tenant-id}/locations
GET /crm/v2/tenant/{tenant-id}/locations/{id}
GET /crm/v2/tenant/{tenant-id}/customers/{customer-id}/locations
```

**Request Payload (estimated):**
```json
{
  "customerId": "string",
  "address": {
    "street": "123 Main St",
    "city": "Henderson",
    "state": "NV",
    "zip": "89015",
    "country": "USA"
  },
  "name": "Primary Residence"
}
```

### 4. Job Types API
**Purpose:** Map our service types to ServiceTitan job types

**Likely Endpoints:**
```
GET /settings/v2/tenant/{tenant-id}/job-types
```

**Our Mapping:**
- `emergency_repair` → ServiceTitan "Emergency Service" job type
- `standard_repair` → ServiceTitan "Repair" job type
- `installation` → ServiceTitan "Installation" job type
- `maintenance` → ServiceTitan "Maintenance" job type

### 5. Availability/Scheduling API (Optional)
**Purpose:** Check technician availability before suggesting time slots

**Likely Endpoints:**
```
GET /scheduling/v2/tenant/{tenant-id}/availability
POST /scheduling/v2/tenant/{tenant-id}/appointments
```

---

## Webhooks

ServiceTitan supports webhooks for real-time status updates.

**Webhook Events We Need:**
- `job.created` - Confirm job was created
- `job.scheduled` - Job assigned to technician
- `job.started` - Technician en route
- `job.completed` - Job finished
- `job.cancelled` - Job cancelled

**Webhook Endpoint (our server):**
```
POST https://aplus-garage-door-chatgpt-app.vercel.app/api/webhooks/servicetitan
```

**Webhook Payload (estimated):**
```json
{
  "eventType": "job.scheduled",
  "eventId": "uuid",
  "tenantId": "string",
  "timestamp": "2026-01-07T10:00:00Z",
  "data": {
    "jobId": "string",
    "jobNumber": "string",
    "status": "Scheduled",
    "scheduledStart": "2026-01-07T14:00:00Z"
  }
}
```

---

## Rate Limits

**Expected Limits (to be confirmed):**
- **Per Tenant:** 1000 requests per hour
- **Per Endpoint:** 100 requests per minute
- **Burst:** 10 requests per second

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1704638400
```

**Our Strategy:**
- Implement exponential backoff on 429 responses
- Queue requests through Inngest (handles rate limiting)
- Cache customer lookups (reduce duplicate API calls)
- Monitor rate limit usage in admin dashboard

---

## Error Handling

**Common Error Codes:**
- `400 Bad Request` - Invalid payload
- `401 Unauthorized` - Invalid/expired token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - ServiceTitan issue

**Our Error Strategy:**
```typescript
try {
  const response = await fetch(servicetitanUrl, { ... });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited - retry with backoff
      await delay(exponentialBackoff(attempt));
      return retry();
    }

    if (response.status === 401) {
      // Token expired - refresh
      await refreshAccessToken();
      return retry();
    }

    if (response.status >= 500) {
      // ServiceTitan error - retry
      if (attempt < 3) return retry();
      // Otherwise, queue for manual review
      await createManualSyncTask(bookingId);
    }

    // Other errors - log and alert
    Sentry.captureException(new Error('ST API Error'), {
      extra: { status: response.status, body: await response.text() }
    });
  }
} catch (error) {
  // Network error - queue for retry
  await inngest.send({ name: 'sync/retry', data: { bookingId, attempt: attempt + 1 } });
}
```

---

## Implementation Plan

### Step 1: Get API Access
- [ ] Contact A Plus ServiceTitan account manager
- [ ] Request API access enablement
- [ ] Obtain credentials:
  - [ ] Client ID
  - [ ] Client Secret
  - [ ] Tenant ID
  - [ ] App Key (if needed)
- [ ] Set up OAuth app in ServiceTitan portal
- [ ] Configure redirect URLs for OAuth flow

### Step 2: Test Connection
- [ ] Implement OAuth 2.0 flow
- [ ] Get access token
- [ ] Test simple GET request (list customers)
- [ ] Verify tenant ID is correct
- [ ] Document actual endpoint URLs

### Step 3: Map Job Types
- [ ] Fetch all job types from ServiceTitan
- [ ] Map our service types to ST job type IDs
- [ ] Store mapping in database (service_titan_settings table)
- [ ] Allow admin to customize mapping

### Step 4: Implement Customer Creation
- [ ] Check if customer exists by phone
- [ ] Create customer if not exists
- [ ] Create location for customer
- [ ] Handle duplicate customer errors
- [ ] Cache customer lookups

### Step 5: Implement Job Creation
- [ ] Build job creation payload
- [ ] Map urgency to priority
- [ ] Map service type to job type ID
- [ ] Set scheduled time based on urgency
- [ ] Create job via API
- [ ] Handle errors gracefully

### Step 6: Set Up Webhooks
- [ ] Register webhook endpoint in ServiceTitan
- [ ] Implement webhook signature verification
- [ ] Handle webhook events
- [ ] Update booking status based on events
- [ ] Log all webhook events

---

## Security Considerations

### Credential Storage
- **DO:** Store in Vercel environment variables
- **DO:** Rotate credentials every 90 days
- **DO:** Use separate credentials for staging/production
- **DON'T:** Commit credentials to git
- **DON'T:** Log credentials in error messages
- **DON'T:** Expose credentials to client-side code

### API Token Management
- **DO:** Refresh tokens before expiration
- **DO:** Handle 401 responses by refreshing
- **DO:** Store tokens encrypted in database
- **DON'T:** Use long-lived tokens (if avoidable)
- **DON'T:** Share tokens between environments

### Webhook Security
- **DO:** Verify webhook signatures
- **DO:** Use HTTPS only
- **DO:** Validate webhook payload structure
- **DON'T:** Trust webhook data without verification
- **DON'T:** Execute arbitrary code from webhook data

---

## Testing Strategy

### Unit Tests
```typescript
describe('ServiceTitan API Client', () => {
  it('creates customer with valid data', async () => {
    const customer = await st.createCustomer({
      name: 'John Doe',
      phone: '7025551234',
      address: '123 Main St, Henderson, NV 89015'
    });

    expect(customer.id).toBeDefined();
    expect(customer.name).toBe('John Doe');
  });

  it('handles duplicate customer error', async () => {
    const result = await st.createCustomer({ ... });

    if (result.error === 'duplicate') {
      const customer = await st.getCustomerByPhone('7025551234');
      expect(customer).toBeDefined();
    }
  });

  it('creates job with emergency priority', async () => {
    const job = await st.createJob({
      customerId: 'cust_123',
      serviceType: 'emergency_repair',
      urgency: 'emergency'
    });

    expect(job.priority).toBe('Emergency');
    expect(job.scheduledStart).toBeLessThan(addHours(new Date(), 2));
  });
});
```

### Integration Tests
```typescript
describe('End-to-End ServiceTitan Integration', () => {
  it('creates booking and syncs to ServiceTitan', async () => {
    // 1. Create booking via MCP
    const booking = await createBooking({ ... });

    // 2. Wait for automatic sync
    await waitFor(() => {
      const updated = getBooking(booking.id);
      return updated.st_sync_status === 'synced';
    }, { timeout: 30000 });

    // 3. Verify job exists in ServiceTitan
    const job = await st.getJob(booking.service_titan_job_id);
    expect(job).toBeDefined();
    expect(job.summary).toContain(booking.issue_summary);
  });
});
```

---

## Monitoring & Alerts

### Metrics to Track
- **Sync Success Rate:** % of bookings successfully synced
- **Sync Latency:** Time from booking creation to ST job creation
- **API Error Rate:** % of API calls that fail
- **Rate Limit Usage:** % of rate limit consumed
- **Webhook Processing Time:** Time to process webhook event

### Alerts to Configure
- **Error Rate >5%** → Email admin + Slack
- **Sync Failure >3 consecutive** → Email admin
- **Rate Limit >80%** → Slack warning
- **Webhook Failure** → Log to Sentry
- **Token Expiration <1 hour** → Refresh automatically

### Dashboard Widgets
```
┌─────────────────────────────────────────┐
│ ServiceTitan Sync Status                │
├─────────────────────────────────────────┤
│ Success Rate: 97.3% ✅                  │
│ Average Latency: 2.4s                   │
│ Failed Today: 3                         │
│ Queue Depth: 0                          │
│                                         │
│ [View Failed Syncs →]                   │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. **Seth:** Obtain ServiceTitan API credentials
2. **Dev:** Test authentication flow
3. **Dev:** Document actual endpoint URLs
4. **Dev:** Implement customer/job creation
5. **Dev:** Set up webhook handler
6. **Dev:** Test end-to-end flow
7. **Team:** Review and approve

---

## References

- ServiceTitan Developer Portal: https://developer.servicetitan.io
- OAuth 2.0 Docs: https://developer.servicetitan.io/docs/oauth20
- API Reference: https://developer.servicetitan.io/apis (requires login)

**Note:** Actual endpoint URLs, request/response formats, and rate limits need to be confirmed once API access is granted. The information above is based on typical RESTful API patterns and may need adjustment.

---

**Last Updated:** January 7, 2026
**Status:** Awaiting API Credentials from Seth
