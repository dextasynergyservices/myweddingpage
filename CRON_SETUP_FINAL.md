# 🚀 Cron Jobs Setup - Complete Guide

## Quick Answer to Your Questions:

### 1. **Will GitHub Actions work with Vercel/Render hosting?**

✅ **YES** - GitHub Actions will work regardless of hosting platform because it makes HTTP requests to your deployed app.

### 2. **How to get CRON_SECRET?**

✅ **Generated for you**: `530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`

---

## 🏆 Recommended Setup by Platform:

### **If hosted on VERCEL (Best option):**

```json
// Already added to your vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/wedding-date-reminders",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/wedding-congratulations",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/expiration-manager",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Setup Steps:**

1. Add the CRON_SECRET to Vercel:
   ```bash
   vercel env add CRON_SECRET
   # Paste: 530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473
   ```
2. Deploy your app
3. Crons will automatically run daily at 8 AM UTC

### **If hosted on RENDER:**

Use external cron service (cron-job.org):

1. **Add CRON_SECRET to Render:**
   - Go to your Render service → Environment
   - Add: `CRON_SECRET=530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`

2. **Set up cron-job.org:**
   - Go to https://cron-job.org (free)
   - Create account and add 3 jobs:

   **Job 1: Wedding Date Reminders**
   - URL: `https://your-render-app.onrender.com/api/cron/wedding-date-reminders`
   - Schedule: `0 8 * * *`
   - Headers: `Authorization: Bearer 530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`

   **Job 2: Wedding Congratulations**
   - URL: `https://your-render-app.onrender.com/api/cron/wedding-congratulations`
   - Schedule: `0 8 * * *`
   - Headers: `Authorization: Bearer 530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`

   **Job 3: Expiration Manager**
   - URL: `https://your-render-app.onrender.com/api/cron/expiration-manager`
   - Schedule: `0 8 * * *`
   - Headers: `Authorization: Bearer 530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`

### **GitHub Actions (Works for both platforms):**

The GitHub Actions workflow I created will also work as a backup or if you prefer this method.

1. **Add secrets to GitHub:**
   - Go to your repo → Settings → Secrets and Variables → Actions
   - Add `CRON_SECRET`: `530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473`
   - Add `APP_URL`: Your production URL

---

## ✅ **What's Already Done:**

1. ✅ **Cron job endpoints created** (wedding reminders, congratulations, expiration manager)
2. ✅ **Authentication added** (CRON_SECRET protection)
3. ✅ **Vercel.json updated** (native Vercel cron support)
4. ✅ **GitHub Actions workflow** (backup/alternative method)
5. ✅ **CRON_SECRET generated** (secure 64-character token)
6. ✅ **Documentation created** (setup guides for all platforms)

---

## 🧪 **Testing Your Setup:**

After deploying, test with:

```bash
curl -X GET "https://your-app.com/api/cron/wedding-date-reminders" \
  -H "Authorization: Bearer 530bd0b84b5d92721641bda943273143b8d4304763a4eb17a4a010ddaa1fe473"
```

Should return:

```json
{
  "success": true,
  "message": "Wedding date reminders sent successfully",
  "results": {...}
}
```

---

## 🎯 **My Recommendation:**

1. **If on Vercel**: Use the Vercel crons (most reliable)
2. **If on Render**: Use cron-job.org + your generated secret
3. **Keep GitHub Actions**: As a backup method

The system will now automatically:

- 📧 Send admin wedding date reminders (3 days, 1 day, wedding day)
- 🎉 Send congratulatory messages to users
- ⚠️ Manage plan expirations and grace periods
- 📱 Send WhatsApp notifications
- 🔄 Run daily at 8:00 AM UTC

You're all set! 🚀
