# A Plus Garage Door - ChatGPT App Proposal

## Executive Summary

This proposal outlines a **ChatGPT application** that will enable A Plus Garage Door to serve **800+ million ChatGPT users** directly within their natural conversation flow. The app provides instant service area verification, intelligent diagnosis, promotional offers, and seamless booking across all Nevada and Utah locations.

---

## 🎯 The Opportunity

### The Problem

- Customers with garage door emergencies often turn to ChatGPT first for advice
- After hours, your phones go unanswered - leads are lost
- Customers in new service areas (Utah expansion) don't know you cover their area
- Manual diagnosis over the phone is time-consuming

### The Solution

A **ChatGPT app** that:
- **Knows** your service areas, availability, promotions, and diagnostic expertise
- **Does** real-time coverage checks, issue diagnosis, and appointment booking
- **Shows** beautiful visual confirmations, promotion cards, and door style galleries

### The Impact

- ✅ 24/7 lead generation and booking
- ✅ Pre-qualified leads (area verified, issue diagnosed)
- ✅ Automated promotion matching
- ✅ Seamless multi-state support
- ✅ Direct ServiceTitan integration

---

## 💼 Business Value

### Revenue Impact

| Metric | Current State | With ChatGPT App | Impact |
|--------|---------------|-------------------|---------|
| **After-hours leads** | Lost | Captured & booked | +15-20 bookings/month |
| **Diagnosis time** | 5-10 min per call | Instant | 2-3 hrs/day saved |
| **Promotion redemption** | ~15% of calls | Auto-matched to 100% | +$3-5K/month |
| **Multi-state coordination** | Separate processes | Unified experience | Reduced confusion |
| **Lead qualification** | Manual | Automated | Better conversion |

### Cost Analysis

| Item | One-Time | Monthly |
|------|----------|---------|
| **Development** | Completed | $0 |
| **Hosting (Vercel)** | $0 | $20 |
| **Maintenance** | $0 | $0-200* |
| **ServiceTitan API** | $0 | Included |

*Optional: Monthly updates to promotions/content ($0 if A Plus team handles)

**ROI Calculation:**
- Cost: ~$20/month
- Value: 15 emergency bookings @ $200 avg = $3,000/month
- **ROI: 15,000%**

---

## 🏗️ Technical Architecture

### 6 Core Capabilities

1. **check_service_area**
   - Validates Nevada (11 areas) & Utah (50+ cities) coverage
   - Returns correct phone number for region
   - Handles out-of-area gracefully

2. **diagnose_issue**
   - Analyzes symptoms from customer description
   - Identifies likely problems (springs, sensors, openers, etc.)
   - Assigns urgency level (emergency/soon/routine)
   - Auto-matches applicable promotions
   - Provides safety warnings when needed

3. **get_promotions**
   - Shows current deals ($30-$200 savings)
   - Filters by service type and issue
   - Updates easily without developer

4. **create_service_request**
   - Books appointments via ServiceTitan
   - Emergency = immediate dispatch
   - Standard = scheduled slots
   - Sends confirmation to customer

5. **get_availability**
   - Shows real-time technician availability
   - Separate scheduling for NV vs UT
   - Respects business hours and territories

6. **get_door_styles**
   - Product catalog with 6 door types
   - Price ranges $800-$7,000+
   - Upsells to consultations
   - Highlights $200 new door promotion

### Technology Stack

- **Backend**: Node.js + TypeScript + MCP SDK
- **Widgets**: React + Tailwind CSS
- **Integration**: ServiceTitan API
- **Hosting**: Vercel (auto-scaling, 99.9% uptime)
- **Data**: JSON config files (easy updates)

---

## 📍 Service Coverage

### Nevada (11 Areas)
Las Vegas, Henderson, North Las Vegas, Boulder City, Mesquite, Summerlin, Paradise, Enterprise, Spring Valley, Sunrise Manor, Whitney

**Phone**: (702) 297-7811

### Utah (50+ Cities)

**Salt Lake Metro**: Salt Lake City, West Valley City, Sandy, West Jordan, South Jordan, Murray, Draper, Riverton, Taylorsville, Midvale, Cottonwood Heights, Herriman, Bluffdale, Millcreek, Holladay, South Salt Lake, Alta

**Provo/Utah Valley**: Provo, Orem, Lehi, American Fork, Spanish Fork, Springville, Payson, Pleasant Grove, Saratoga Springs, Eagle Mountain, Alpine, Highland, Lindon, Vineyard, Mapleton, Salem, Santaquin, and 10 more

**Ogden Area**: Ogden, Roy, North Ogden, South Ogden, Riverdale, Washington Terrace, Hooper, Harrisville, Pleasant View, Farr West, Plain City, West Haven, Marriott-Slaterville, Uintah, Huntsville

**Southern Utah**: St. George (headquarters)

**Phone**: (801) 683-6222

---

## 🎁 Integrated Promotions

All promotions are **automatically matched** to diagnosed issues:

| Promotion | Discount | Trigger |
|-----------|----------|---------|
| **Spring Special** | $75 off 2 / $30 off 1 | Broken spring diagnosis |
| **New Door** | $200 off | Installation inquiry |
| **Tune-Up** | $49 (reg $89) | Maintenance need |
| **Opener Special** | $100 off LiftMaster | Opener failure |
| **Winterization** | 50% off | Weather seal issues |
| **Bundle** | $287 value free | New door + opener |

---

## 🚀 Implementation Plan

### Phase 1: Setup & Testing (Week 1)
- [x] Development complete
- [ ] Deploy to Vercel
- [ ] Connect ServiceTitan API credentials
- [ ] Internal testing with A Plus team
- [ ] Adjust any copy/promotions

### Phase 2: Submit to OpenAI (Week 2)
- [ ] Create app listing
- [ ] Submit required materials:
  - App description
  - Privacy policy
  - Support contact
  - Screenshots
  - Testing guidelines
- [ ] OpenAI review (~1-2 weeks)

### Phase 3: Launch (Week 4)
- [ ] Receive approval
- [ ] Publish to ChatGPT users
- [ ] Monitor initial usage
- [ ] Gather feedback

### Phase 4: Optimize (Ongoing)
- [ ] Track conversion metrics
- [ ] Update promotions seasonally
- [ ] Add new service areas as you expand
- [ ] Refine based on user behavior

---

## 📊 Success Metrics

Track these KPIs after launch:

| Metric | Target (Month 1) |
|--------|------------------|
| Tool invocations | 500+ |
| Service area checks | 300+ |
| Issue diagnoses | 200+ |
| Appointment bookings | 50+ |
| Diagnosis → booking rate | 25% |
| Promotion redemptions | 30+ |

---

## 🔒 Security & Privacy

- ✅ No customer data stored by app
- ✅ All bookings go directly to ServiceTitan
- ✅ HTTPS encryption on all endpoints
- ✅ No authentication needed (public-facing service)
- ✅ Rate limiting to prevent abuse
- ✅ Complies with OpenAI's app policies

---

## 🎓 Training & Handoff

### What Your Team Needs to Know

**For Marketing/Sales:**
- How to update promotions (edit JSON file)
- How to add new service areas (edit JSON file)
- How to track app-sourced leads in ServiceTitan

**For Dispatchers:**
- Bookings from ChatGPT marked as source: "chatgpt_app"
- Same workflow as online bookings
- Customer already knows estimated cost

**For Technicians:**
- Customer has already received diagnosis
- Likely issue is pre-identified
- Promotion may be applied

### Documentation Provided
- [x] README.md - Complete technical guide
- [x] DEMO-SCRIPT.md - Presentation guide
- [x] CLAUDE.md - AI assistant instructions
- [x] ARCHITECTURE.md - Detailed specifications
- [x] This proposal document

---

## ❓ FAQ

**Q: What if we want to change promotions?**
A: Edit `src/tools/get-promotions.ts`, update the PROMOTIONS array, redeploy. Takes 5 minutes.

**Q: Can we add new service cities?**
A: Yes! Edit `service-areas-data.json`, add the city with zip prefix and coordinates. Instant update.

**Q: What happens if ServiceTitan is down?**
A: App gracefully falls back to phone number and encourages direct calls.

**Q: Can customers book specific technicians?**
A: Not currently, but this can be added if ServiceTitan supports it.

**Q: How do we handle after-hours bookings?**
A: App books into next available slot. For emergencies, shows emergency hotline.

**Q: What if we open a new state (Arizona, etc.)?**
A: Add the new state to service-areas-data.json with phone number and cities. Works immediately.

**Q: Can we white-label this for franchises?**
A: Yes, architecture supports multi-brand configuration.

---

## 💰 Pricing

### Option 1: Self-Hosted (Recommended)
- **Monthly**: $20 Vercel hosting
- **Setup**: Included (already built)
- **Support**: Documentation provided
- **Customization**: Full control

### Option 2: Managed Service
- **Monthly**: $299 (includes hosting + updates)
- **Setup**: Included
- **Support**: Priority email/phone
- **Customization**: Monthly update included
- **Promotions**: We update for you
- **Reporting**: Monthly analytics

---

## ✅ Next Steps

1. **Review** this proposal with stakeholders
2. **Schedule** demo (use DEMO-SCRIPT.md)
3. **Provide** ServiceTitan API credentials
4. **Approve** final copy and promotions
5. **Deploy** to production
6. **Submit** to OpenAI
7. **Launch** to 800M users! 🚀

---

## 📞 Questions?

Contact me to discuss:
- Technical implementation
- ServiceTitan integration
- Custom features
- Timeline and deployment

---

**Let's bring A Plus Garage Door to ChatGPT users everywhere.**

---

### Appendix: Sample Conversations

See `DEMO-SCRIPT.md` for full conversation examples including:
- Emergency repair in Henderson
- Scheduled maintenance in Salt Lake City
- New door purchase in Provo
- Out-of-area request handling
