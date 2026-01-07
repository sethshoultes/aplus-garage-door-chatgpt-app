# Pricing Analysis - Infrastructure Costs
**Date:** January 7, 2026
**For:** A Plus Garage Door MCP Server v2.0

---

## Summary

**Estimated Monthly Cost:** $0 - $85/month (depending on usage)
**Initial Phase (Low Traffic):** ~$0/month (all free tiers)
**Growth Phase (100+ bookings/month):** ~$40/month
**Scale Phase (1000+ bookings/month):** ~$85/month

---

## Service Breakdown

### 1. Vercel (Hosting)

**What:** Serverless hosting for MCP server and admin interface

**Pricing Tiers:**
- **Hobby (Free):**
  - 100GB bandwidth/month
  - 100 hours serverless function execution
  - 6,000 minutes build time
  - **Perfect for:**Starting out, <50 bookings/month

- **Pro ($20/month):**
  - 1TB bandwidth
  - 1,000 hours function execution
  - 24,000 minutes build time
  - **Upgrade when:** >50 bookings/month, need faster builds

**Our Recommendation:** Start with **Hobby (FREE)**, upgrade to Pro if needed

**Estimated Cost:** $0 - $20/month

---

### 2. Vercel Postgres (Database)

**What:** PostgreSQL database for storing bookings, service areas, promotions

**Pricing Tiers:**
- **Hobby (Free):**
  - 256 MB storage
  - 60 hours compute time/month
  - ~5,000 rows (estimated)
  - **Perfect for:** Testing, first 3-6 months

- **Pro ($20/month):**
  - 512 MB storage
  - 100 hours compute time/month
  - ~50,000 rows (estimated)
  - **Upgrade when:** >5,000 bookings or >60 hours compute

**Our Recommendation:** Start with **Hobby (FREE)**, upgrade to Pro if needed

**Data Size Estimates:**
- 1 booking ≈ 2 KB
- 100 bookings ≈ 200 KB
- 5,000 bookings ≈ 10 MB (well within free tier)

**Estimated Cost:** $0 - $20/month

---

### 3. Clerk (Authentication)

**What:** Authentication for admin interface

**Pricing Tiers:**
- **Free:**
  - 10,000 monthly active users (MAUs)
  - Basic auth (email/password, social login)
  - **Perfect for:** Admin interface (you + office staff = <10 users)

- **Pro ($25/month):**
  - 10,000 MAUs
  - Multi-factor authentication (MFA)
  - Advanced security features
  - **Upgrade for:** MFA requirement (recommended for production)

**Our Recommendation:** Start with **Free**, upgrade to Pro for MFA ($25/month)

**Note:** Since only admin staff uses the interface (not customers), you'll never hit the MAU limit.

**Estimated Cost:** $0 - $25/month

---

### 4. Inngest (Job Queue)

**What:** Background job processing for ServiceTitan sync

**Pricing Tiers:**
- **Free:**
  - 50,000 function runs/month
  - 100,000 steps/month
  - **Perfect for:** <1,600 bookings/month (assuming 3 retries max)

- **Pro ($20/month):**
  - 200,000 function runs/month
  - 500,000 steps/month
  - **Upgrade when:** >1,600 bookings/month

**Our Calculation:**
- 1 booking = 1 sync attempt
- Failed sync = up to 3 retries
- Average: 1.2 runs per booking (assuming 80% success rate)
- 50,000 runs / 1.2 = ~41,000 bookings/month (way more than needed)

**Our Recommendation:** **Free tier** is plenty

**Estimated Cost:** $0 - $20/month (unlikely to need Pro)

---

### 5. Sentry (Error Monitoring)

**What:** Error tracking and performance monitoring

**Pricing Tiers:**
- **Developer (Free):**
  - 5,000 errors/month
  - 10,000 transactions/month
  - 1 user
  - **Perfect for:** Low traffic, starting out

- **Team ($26/month):**
  - 50,000 errors/month
  - 100,000 transactions/month
  - Unlimited users
  - **Upgrade when:** >5,000 errors (hopefully never!) or >10K transactions

**Our Recommendation:** Start with **Free**, upgrade if hit limits

**Estimated Cost:** $0 - $26/month

---

### 6. Upstash Redis (Rate Limiting)

**What:** In-memory cache for rate limiting

**Pricing Tiers:**
- **Free:**
  - 10,000 commands/day
  - 256 MB storage
  - **Perfect for:** Rate limiting (simple increment operations)

- **Pay-as-you-go:**
  - $0.20 per 100K commands
  - **Upgrade when:** >10,000 commands/day (300K+/month)

**Our Calculation:**
- 100 bookings/day = 100 rate limit checks
- Well within free tier (10,000/day)

**Our Recommendation:** **Free tier** is sufficient

**Estimated Cost:** $0 - $5/month (unlikely to exceed free tier)

---

### 7. Resend (Email) - Optional

**What:** Transactional emails (booking confirmations)

**Pricing Tiers:**
- **Free:**
  - 3,000 emails/month
  - 100 emails/day
  - **Perfect for:** <100 bookings/day

- **Pro ($20/month):**
  - 50,000 emails/month
  - **Upgrade when:** >3,000 emails/month

**Our Recommendation:** Start with **Free**, upgrade if needed

**Estimated Cost:** $0 - $20/month

---

### 8. Twilio (SMS) - Optional

**What:** SMS confirmations and reminders

**Pricing:**
- **Pay-as-you-go:** $0.0079 per SMS (US)
- **No monthly fee** (just usage)

**Calculation:**
- 100 bookings/month × 2 SMS (confirmation + reminder) = 200 SMS
- 200 × $0.0079 = **$1.58/month**
- 1,000 bookings/month = **$15.80/month**

**Our Recommendation:** **Enable if budget allows** (~$2-$16/month)

**Estimated Cost:** $2 - $16/month

---

## Total Cost Scenarios

### Scenario 1: Launch (Months 1-3)
**Traffic:** 10-50 bookings/month
**Services:**
- Vercel: Free
- Vercel Postgres: Free
- Clerk: Free
- Inngest: Free
- Sentry: Free
- Upstash: Free
- Resend: Free
- Twilio: $1-$4/month

**Total:** **$1 - $4/month** 💚

---

### Scenario 2: Growth (Months 4-12)
**Traffic:** 100-500 bookings/month
**Services:**
- Vercel: Free → Pro ($20)
- Vercel Postgres: Free → Pro ($20)
- Clerk: Pro with MFA ($25)
- Inngest: Free
- Sentry: Free
- Upstash: Free
- Resend: Free
- Twilio: $15/month

**Total:** **$80/month** 🟡

---

### Scenario 3: Scale (Year 2+)
**Traffic:** 1,000+ bookings/month
**Services:**
- Vercel Pro: $20
- Vercel Postgres Pro: $20
- Clerk Pro: $25
- Inngest: Pro $20 (if needed)
- Sentry: Team $26
- Upstash: Free or $5
- Resend: Pro $20
- Twilio: $16/month

**Total:** **$152/month** 🔴

---

## Cost Optimization Strategies

### 1. Stay on Free Tiers Longer
- **Optimize database queries** → reduce compute hours
- **Cache service areas/promotions** → reduce DB reads
- **Batch operations** → reduce function runs
- **Archive old bookings** → keep storage low

### 2. Only Enable What You Need
**Phase 1 (Must-Have):**
- ✅ Vercel (Free)
- ✅ Vercel Postgres (Free)
- ✅ Clerk (Free → $25 for MFA)
- ✅ Inngest (Free)

**Phase 2 (Nice-to-Have):**
- ⏸️ Sentry (Free → add if errors increase)
- ⏸️ Upstash (Free)

**Phase 3 (Optional):**
- 🚫 Resend (only if you want email confirmations)
- 🚫 Twilio (only if you want SMS confirmations)

### 3. Bundled Alternatives
Instead of multiple services, consider:
- **Supabase** (replaces Vercel Postgres + Clerk) - $25/month for both
- **PlanetScale** (replaces Vercel Postgres) - Free tier available
- **Railway** (all-in-one hosting) - $5/month + usage

**Our Recommendation:** Stick with Vercel ecosystem (best DX, easy deployment)

---

## Budget Recommendations

### Conservative Budget (Recommended)
**Phase 1:** $0-$5/month (all free tiers + SMS)
**Phase 2:** $40/month (add Clerk Pro, Vercel Pro if needed)
**Phase 3:** $85/month (add email/SMS, Sentry Team)

### Aggressive Budget (Full-Featured from Start)
**Day 1:** $85/month (all Pro tiers, email, SMS, MFA)

### Shoestring Budget (Absolute Minimum)
**Use Free Tiers Only:** $0/month
- Skip email confirmations
- Skip SMS confirmations
- Skip MFA (not recommended)
- Upgrade only when hitting limits

---

## What You're Paying For

### Vercel ($20/month when upgraded)
- **Saves:** 10+ hours/month in DevOps (no servers to manage)
- **Provides:** Auto-scaling, CDN, zero-downtime deploys

### Vercel Postgres ($20/month when upgraded)
- **Saves:** 5+ hours/month in database management
- **Provides:** Automatic backups, scaling, security patches

### Clerk ($25/month)
- **Saves:** 20+ hours building auth system
- **Provides:** MFA, user management, SSO, security compliance

### Inngest ($20/month if upgraded)
- **Saves:** 10+ hours building job queue
- **Provides:** Automatic retries, monitoring, observability

**ROI Calculation:**
- Time saved: ~45 hours/month
- Developer rate: $100/hour
- Value: $4,500/month
- Cost: $85/month
- **ROI: 53x** 🚀

---

## Billing Management

### Vercel
- Billed monthly to credit card
- Dashboard: https://vercel.com/billing
- Alerts: Set usage alerts at 80%

### Clerk
- Billed monthly to credit card
- Dashboard: https://dashboard.clerk.com/billing
- Alerts: Email when approaching MAU limit

### Inngest
- Billed monthly to credit card
- Dashboard: https://app.inngest.com/billing
- Alerts: Email when approaching run limit

### Twilio
- Pay-as-you-go (charges at end of month)
- Dashboard: https://console.twilio.com/billing
- Alerts: Set spending limit ($50/month cap)

---

## Questions & Answers

**Q: Can we start with $0/month?**
A: Yes! All services have free tiers sufficient for initial launch.

**Q: When do we need to upgrade?**
A: Monitor usage dashboards. Upgrade when you hit 80% of free tier limits.

**Q: Can we reduce costs later?**
A: Yes, you can downgrade plans if traffic decreases. No long-term contracts.

**Q: What if we can't afford paid tiers?**
A: Optimize code to stay in free tiers longer, or use open-source alternatives (self-hosted Postgres, NextAuth instead of Clerk, BullMQ instead of Inngest).

**Q: Are there setup fees?**
A: No setup fees for any service.

**Q: Can we expense this to A Plus?**
A: Yes, this is a business expense for customer acquisition software.

---

## Recommended Plan

### Start: Month 1
**Services:** Vercel (Free), Postgres (Free), Clerk (Free), Inngest (Free)
**Cost:** **$0/month**
**Monitor:** Usage dashboards weekly

### Month 2-3: Add Security
**Upgrade:** Clerk to Pro ($25) for MFA
**Cost:** **$25/month**
**Why:** Protect customer data with 2FA

### Month 4-6: Add Reliability
**Upgrade:** Vercel & Postgres to Pro ($40)
**Add:** Sentry Free
**Cost:** **$65/month**
**Why:** Better performance, monitoring

### Month 6+: Add Communications
**Add:** Resend (Free or Pro), Twilio (usage-based)
**Cost:** **$65 - $85/month**
**Why:** Customer confirmations, better UX

---

## Cost Tracking Spreadsheet

I recommend creating a Google Sheet to track:

| Month | Bookings | Vercel | Postgres | Clerk | Inngest | Sentry | Resend | Twilio | Total |
|-------|----------|--------|----------|-------|---------|--------|--------|--------|-------|
| Jan   | 10       | $0     | $0       | $0    | $0      | $0     | $0     | $0.80  | $0.80 |
| Feb   | 25       | $0     | $0       | $25   | $0      | $0     | $0     | $2.00  | $27   |
| Mar   | 50       | $0     | $0       | $25   | $0      | $0     | $0     | $4.00  | $29   |
| Apr   | 100      | $20    | $20      | $25   | $0      | $0     | $0     | $8.00  | $73   |

---

## Final Recommendation

**Phase 1 (Now):** Use all free tiers - **$0/month**
**Phase 2 (Month 2):** Add Clerk Pro for MFA - **$25/month**
**Phase 3 (When needed):** Upgrade Vercel/Postgres - **$65/month**
**Phase 4 (Optional):** Add email/SMS - **$85/month**

**Total Investment Year 1:** ~$600 (average $50/month)

This is **very affordable** for a production SaaS application that captures customer leads 24/7.

---

**Last Updated:** January 7, 2026
**Next Review:** After Month 1 launch
