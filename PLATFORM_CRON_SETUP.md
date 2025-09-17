# Cron Job Setup for Multiple Hosting Platforms

## Platform-Specific Setup

### 1. Vercel (Recommended if hosted on Vercel)

Vercel has native cron support. Add this to your `vercel.json`:

```json
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

**Advantages:**

- Built into Vercel platform
- No external dependencies
- More reliable than GitHub Actions
- Better logging and monitoring

### 2. Render + External Cron Service

Since Render doesn't have native cron support, use an external service:

**Option A: cron-job.org (Free)**

1. Go to https://cron-job.org
2. Create account and add these jobs:
   - URL: `https://your-render-app.onrender.com/api/cron/wedding-date-reminders`
   - Schedule: `0 8 * * *` (8:00 AM daily)
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
3. Repeat for other endpoints

**Option B: EasyCron (Paid)**

- More reliable than free services
- Better monitoring and alerts

### 3. GitHub Actions (Works for both)

The GitHub Actions approach works for any hosting platform by making HTTP requests to your deployed app.

## Generating Cron Secret

### Method 1: Online Generator (Quick)

```bash
# Visit any of these sites:
# - https://www.random.org/passwords/
# - https://passwordsgenerator.net/
# Generate a 32+ character random string
```

### Method 2: Command Line (Secure)

```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# On Linux/Mac:
openssl rand -base64 32

# On Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Manual Generation

Create a random string like: `mw2024_cron_secret_abc123xyz789_secure_token_456`

## Setting Up Environment Variables

### For Vercel:

```bash
# Using Vercel CLI
vercel env add CRON_SECRET

# Or in Vercel Dashboard:
# Project Settings → Environment Variables → Add
```

### For Render:

```bash
# In Render Dashboard:
# Your Service → Environment → Add Environment Variable
# Key: CRON_SECRET
# Value: your-generated-secret
```

### Example .env (for reference only):

```env
CRON_SECRET=your-32-character-random-string-here
APP_URL=https://your-app-domain.com
```

## Testing Your Setup

### Test Cron Secret Generation:

```bash
# Test the secret works
curl -X GET "https://your-app.com/api/cron/wedding-date-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return success response, not 401 Unauthorized
```

## Recommended Approach by Platform:

1. **If hosted on Vercel**: Use Vercel crons (`vercel.json`)
2. **If hosted on Render**: Use cron-job.org + generated secret
3. **If using multiple platforms**: GitHub Actions as fallback

The Vercel approach is most reliable if you're using Vercel for hosting.
