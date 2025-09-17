# MyWeddingPage Automated Cron Jobs Setup

This document explains how to set up and manage the automated cron jobs for MyWeddingPage.

## Overview

The system includes three automated cron jobs that run daily at 8:00 AM UTC:

1. **Wedding Date Reminders** - Admin notifications for upcoming weddings
2. **Wedding Congratulations** - User congratulatory messages
3. **Expiration Manager** - Plan expiration and grace period management

## Cron Jobs Description

### 1. Wedding Date Reminders (`/api/cron/wedding-date-reminders`)

- **Purpose**: Send admin notifications for upcoming weddings
- **Triggers**: 3 days before, 1 day before, and on wedding day
- **Recipients**: Admin email and WhatsApp
- **Content**: Wedding details with direct links to wedding pages

### 2. Wedding Congratulations (`/api/cron/wedding-congratulations`)

- **Purpose**: Send congratulatory messages to users
- **Triggers**: 1 day before and on wedding day
- **Recipients**: Users via email and WhatsApp
- **Content**: Beautiful congratulatory messages with blessings

### 3. Expiration Manager (`/api/cron/expiration-manager`)

- **Purpose**: Manage plan expirations and grace periods
- **Features**:
  - 7-day expiration warnings
  - Grace period activation and reminders
  - Automatic wedding page deletion after grace period
  - Multi-channel notifications (email + WhatsApp)
  - Admin alerts for all expiration events

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your production environment:

```env
# Cron Job Security
CRON_SECRET=your-secure-cron-secret-here

# Application URL (for cron job calls)
APP_URL=https://your-domain.com

# Email Configuration (already required)
EMAIL_FROM=your-admin-email@domain.com

# WhatsApp Configuration (already required)
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### 2. GitHub Repository Secrets

In your GitHub repository settings, add these secrets:

1. **CRON_SECRET**: A secure random string for authenticating cron job requests
2. **APP_URL**: Your production application URL (e.g., `https://yourapp.vercel.app`)

### 3. GitHub Actions Workflow

The cron jobs are scheduled using GitHub Actions in `.github/workflows/cron-jobs.yml`:

- **Schedule**: Daily at 8:00 AM UTC
- **Manual Trigger**: Available via workflow_dispatch
- **Error Handling**: Automatic retry with failure notifications

### 4. Testing Cron Jobs

You can test the cron jobs manually using curl:

```bash
# Test wedding date reminders
curl -X GET "https://your-app-url.com/api/cron/wedding-date-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test wedding congratulations
curl -X GET "https://your-app-url.com/api/cron/wedding-congratulations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test expiration manager
curl -X GET "https://your-app-url.com/api/cron/expiration-manager" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Security Features

- **Authentication**: All cron endpoints require a valid `CRON_SECRET` token
- **Authorization Header**: Bearer token authentication
- **Rate Limiting**: Built-in retry mechanisms with delays
- **Failure Notifications**: Automatic admin alerts on job failures

## Monitoring and Maintenance

### Logs and Monitoring

- Check GitHub Actions logs for cron job execution status
- Monitor application logs for detailed error information
- Set up alerts for repeated failures

### Manual Execution

- Use GitHub Actions "Run workflow" button for manual triggers
- Test individual endpoints during development
- Verify email and WhatsApp deliveries

### Troubleshooting

**Common Issues:**

1. **Authentication Errors**: Verify CRON_SECRET is set correctly
2. **Email Failures**: Check EMAIL_FROM and Resend configuration
3. **WhatsApp Failures**: Verify Twilio credentials and phone numbers
4. **Timeout Errors**: Increase timeout values in GitHub Actions

**Error Monitoring:**

- Check `/api/admin/notify-failure` endpoint logs
- Monitor admin email for failure notifications
- Review individual cron job response logs

## Alternative Scheduling Options

If GitHub Actions is not suitable, you can use:

1. **Vercel Cron Jobs** (if deployed on Vercel)
2. **External Cron Services** (like cron-job.org)
3. **Server-based Cron** (if you have your own server)

Simply call the same endpoints with the proper authentication headers.

## Customization

### Timezone Adjustment

To change the execution time, modify the cron expression in `.github/workflows/cron-jobs.yml`:

```yaml
# Current: Daily at 8:00 AM UTC
- cron: "0 8 * * *"

# Example: Daily at 2:00 PM UTC (8:00 AM EST)
- cron: "0 14 * * *"
```

### Frequency Changes

You can adjust the frequency by modifying the cron expression:

```yaml
# Twice daily (8 AM and 8 PM UTC)
- cron: "0 8,20 * * *"

# Every 6 hours
- cron: "0 */6 * * *"
```

## Support

For issues or questions about the cron job setup, check:

1. GitHub Actions logs
2. Application error logs
3. Admin email notifications
4. Individual endpoint responses

The system is designed to be self-monitoring with comprehensive error reporting and automatic retry mechanisms.
