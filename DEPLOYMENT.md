# Deployment Instructions

Your A Plus Garage Door ChatGPT app is ready to deploy to Vercel! Follow these simple steps.

## ✅ What's Already Done

- ✅ GitHub repository created: https://github.com/sethshoultes/aplus-garage-door-chatgpt-app
- ✅ Code pushed to GitHub
- ✅ Vercel configuration file created (`vercel.json`)
- ✅ Build scripts configured
- ✅ Environment variables set

## 🚀 Deploy to Vercel (3 Easy Steps)

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**

### Step 2: Import Your GitHub Repository

1. You'll see "Import Git Repository"
2. Find `aplus-garage-door-chatgpt-app` in the list
   - If you don't see it, click "Adjust GitHub App Permissions" to give Vercel access
3. Click **"Import"**

### Step 3: Configure & Deploy

1. **Project Name**: Leave as `aplus-garage-door-chatgpt-app` (or rename if you want)
2. **Framework Preset**: Select "Other" or "Node.js"
3. **Root Directory**: Leave as `./` (default)
4. **Build Command**: Should auto-detect `npm run vercel-build`
5. **Environment Variables**: Already configured in `vercel.json` ✅
6. Click **"Deploy"**

### That's It! 🎉

Vercel will:
- Install dependencies
- Build your project
- Deploy to production
- Give you a live URL

**Deployment time:** ~2-3 minutes

## 📱 Your Live URLs

After deployment, you'll get:

**Main Demo:**
```
https://aplus-garage-door-chatgpt-app.vercel.app/chatgpt-demo.html
```

**Simple Entry Page:**
```
https://aplus-garage-door-chatgpt-app.vercel.app/simple-demo.html
```

**Static Demo (no API key needed):**
```
https://aplus-garage-door-chatgpt-app.vercel.app/demo.html
```

**MCP Server Endpoint:**
```
https://aplus-garage-door-chatgpt-app.vercel.app/test-tool
```

## 🔧 After Deployment

### Test Your Deployment

1. Visit your Vercel URL
2. Enter your OpenAI API key
3. Try the quick action buttons
4. Verify widgets display correctly

### Share with A Plus

Send them the link:
```
https://aplus-garage-door-chatgpt-app.vercel.app/simple-demo.html
```

They can test it immediately with no setup!

## 🌐 Adding a Custom Domain (Optional)

### If A Plus Already Owns a Domain

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Add: `chatgpt.aplusgaragedoorrepair.com` (or similar)
4. Vercel will give you DNS instructions
5. Add the DNS record at their domain registrar
6. Wait 5-10 minutes for DNS propagation
7. Done! Free SSL included ✅

**Cost:** $0 (using existing domain)

### If You Need a New Domain

1. Buy domain at Namecheap or GoDaddy (~$12/year)
2. Follow same steps above
3. Point DNS to Vercel

**Cost:** ~$1/month

## 📊 Monitoring Your Deployment

### View Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"**
4. Click any deployment to see logs

### View Analytics
1. Click **"Analytics"** tab
2. See visitor count, page views, etc.

### Update Your Code

When you make changes:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel automatically redeploys! 🚀

## 🆘 Troubleshooting

### Build Failed?

Check the build logs in Vercel dashboard:
- Look for error messages
- Usually it's a missing dependency or build script issue

### Environment Variables Not Working?

1. Go to **Settings** → **Environment Variables**
2. Add them manually:
   - `USE_MOCK_API` = `true`
   - `PHONE_NEVADA` = `(702) 297-7811`
   - `PHONE_UTAH` = `(801) 683-6222`

### 404 Errors?

Make sure the routes in `vercel.json` are correct.

## 💰 Vercel Pricing

**Free Tier Includes:**
- 100 GB bandwidth/month
- Unlimited deployments
- Custom domains
- SSL certificates
- Team collaboration (up to 3 members)

**You won't need to pay** unless you exceed:
- 100 GB bandwidth
- Very high traffic (thousands of visitors/day)

**Estimated cost for A Plus:** $0/month (free tier is plenty)

## 📞 Next Steps

1. ✅ Deploy to Vercel (3 minutes)
2. ✅ Test the live demo
3. ✅ Share with A Plus team
4. ✅ Get their feedback
5. ⏳ Add custom domain (if approved)
6. ⏳ Connect to OpenAI (if approved)
7. ⏳ Replace mock ServiceTitan with real API (if approved)

## 🎯 Production Checklist (When A Plus Approves)

- [ ] Get custom domain from A Plus
- [ ] Configure custom domain in Vercel
- [ ] Get ServiceTitan API credentials
- [ ] Update environment variables with real API keys
- [ ] Submit to OpenAI for ChatGPT integration approval
- [ ] Test with real customers
- [ ] Monitor usage and feedback

---

**Questions?** Check the Vercel dashboard or documentation at https://vercel.com/docs
