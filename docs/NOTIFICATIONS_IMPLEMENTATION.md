# Push Notifications Implementation Guide

## 📱 **Notification Types**

### **1. Instant Notifications (Event-Driven)**

Triggered immediately when actions occur:

| Event                 | Notification                                     | When                        |
| --------------------- | ------------------------------------------------ | --------------------------- |
| ✅ **Task Completed** | "Great progress! You completed: [Task Title]"    | When task marked complete   |
| 🎉 **RSVP Response**  | "[Guest Name] will attend your wedding!"         | When guest responds to RSVP |
| 👥 **Guest Added**    | "[Guest Name] has been added to your guest list" | When new guest added        |
| 📸 **Gallery Upload** | "5 photos added to your gallery"                 | When photos uploaded        |

### **2. Scheduled Notifications (Cron-Based)**

Sent automatically via daily cron job at 9:00 AM:

| Type                         | Notification                     | Schedule                  |
| ---------------------------- | -------------------------------- | ------------------------- |
| ⚠️ **Subscription - 7 Days** | "Subscription expires in 7 days" | 7 days before expiration  |
| 🚨 **Subscription - 3 Days** | "Only 3 days left!"              | 3 days before expiration  |
| 🔴 **Subscription - 1 Day**  | "Last chance to renew"           | 1 day before expiration   |
| ❌ **Subscription Expired**  | "Grace period starts"            | Expiration day            |
| ⏰ **Grace Period**          | "X days left to renew"           | Daily during grace period |
| 💍 **Wedding - 7 Days**      | "7 days until your special day!" | 7 days before wedding     |
| 🎊 **Wedding - 3 Days**      | "3 days until your wedding!"     | 3 days before wedding     |
| 💕 **Wedding - 1 Day**       | "Tomorrow is the big day!"       | 1 day before wedding      |
| 🎉 **Wedding Day**           | "Today is your wedding day!"     | Wedding day               |
| 📋 **Task Reminder**         | "You have X incomplete tasks"    | Every Monday (weekly)     |

---

## 🏗️ **Architecture**

### **File Structure:**

```
src/
  lib/
    notifications/
      notificationService.ts   # Core notification logic & templates
      index.ts                 # Exports
  app/
    api/
      notifications/
        subscribe/route.ts     # User subscription management
        send/route.ts          # Manual notification sending (admin)
      cron/
        notifications/route.ts # Unified cron job (NEW)
        subscription-expiration-notifications/route.ts # (OLD - can be removed)
      tasks/
        [token]/route.ts       # ✅ Sends notification on task complete
      rsvp/
        [token]/route.ts       # ✅ Sends notification on RSVP response
```

---

## 🔧 **How It Works**

### **Instant Notifications Flow:**

```
1. User marks task complete
   ↓
2. API: /api/tasks/[token]
   ↓
3. Update database
   ↓
4. Call: sendNotificationToUser(userId, createTaskNotification(title))
   ↓
5. Fetch user's push subscriptions
   ↓
6. Send web push notification
   ↓
7. Notification appears on user's device instantly!
```

### **Scheduled Notifications Flow:**

```
1. Cron job runs daily at 9:00 AM
   ↓
2. API: /api/cron/notifications (GET)
   ↓
3. Check authorization (CRON_SECRET)
   ↓
4. Query database for:
   - Users with subscriptions expiring soon
   - Users with upcoming weddings
   - Users with incomplete tasks (Mondays only)
   ↓
5. Send notifications to each user
   ↓
6. Return summary of sent/failed notifications
```

---

## 📝 **Usage Examples**

### **1. Task Completion (Instant)**

**Already implemented in:** `src/app/api/tasks/[token]/route.ts`

```typescript
// When task marked complete:
const { sendNotificationToUser, createTaskNotification } = await import(
  "@/lib/notifications/notificationService"
);
const notification = createTaskNotification(taskTitle);
await sendNotificationToUser(userId, notification);

// User sees: "✅ Task Completed! Great progress! You completed: Buy wedding rings"
```

### **2. RSVP Response (Instant)**

**Already implemented in:** `src/app/api/rsvp/[token]/route.ts`

```typescript
// When guest responds to RSVP:
const { sendNotificationToUser, createRSVPNotification } = await import(
  "@/lib/notifications/notificationService"
);
const notification = createRSVPNotification(guestName, status);
await sendNotificationToUser(userId, notification);

// User sees: "🎉 RSVP Response: John Smith will attend your wedding!"
```

### **3. Guest Added (Future Implementation)**

```typescript
// When new guest added:
import {
  sendNotificationToUser,
  createGuestAddedNotification,
} from "@/lib/notifications/notificationService";

const notification = createGuestAddedNotification(guestName);
await sendNotificationToUser(userId, notification);

// User sees: "👥 New Guest Added: Jane Doe has been added to your guest list"
```

### **4. Gallery Upload (Future Implementation)**

```typescript
// When photos uploaded:
import {
  sendNotificationToUser,
  createGalleryNotification,
} from "@/lib/notifications/notificationService";

const notification = createGalleryNotification(photoCount);
await sendNotificationToUser(userId, notification);

// User sees: "📸 New Photos! 5 photos added to your gallery"
```

---

## 🚀 **Deployment Setup**

### **1. Environment Variables**

Add to your hosting platform (Vercel/Render/etc.):

```env
# VAPID Keys for Web Push (already generated)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNcTra...
VAPID_PRIVATE_KEY=7Goaq...
VAPID_SUBJECT=mailto:support@myweddingpage.com

# Cron Secret (for authorization)
CRON_SECRET=your_random_secret_32_chars_minimum
```

### **2. Cron Job Configuration**

Configure your platform to call the notification endpoint:

**Endpoint:** `GET /api/cron/notifications`

**Authorization:** `Bearer YOUR_CRON_SECRET`

**Schedule:** Daily at 9:00 AM (0 9 \* \* \*)

#### **Vercel (vercel.json):**

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### **Render (render.yaml):**

```yaml
services:
  - type: web
    name: myweddingpage
    env: node
    plan: starter
    buildCommand: pnpm build
    startCommand: pnpm start
    envVars:
      - key: CRON_SECRET
        sync: false

  # Add cron job
  - type: cron
    name: daily-notifications
    env: node
    schedule: "0 9 * * *"
    buildCommand: ""
    startCommand: "curl -X GET https://your-domain.com/api/cron/notifications -H 'Authorization: Bearer $CRON_SECRET'"
```

#### **Easycron / External Service:**

```
URL: https://your-domain.com/api/cron/notifications
Method: GET
Headers: Authorization: Bearer YOUR_CRON_SECRET
Schedule: 0 9 * * * (Every day at 9:00 AM)
```

---

## 🧪 **Testing**

### **Test Instant Notifications:**

1. **Enable notifications** in dashboard
2. **Mark a task complete** → Should see notification instantly
3. **Submit RSVP response** → Should see notification instantly

### **Test Scheduled Notifications:**

```bash
# Call cron endpoint manually:
curl -X GET http://localhost:3000/api/cron/notifications \
  -H "Authorization: Bearer your_cron_secret"

# Response:
{
  "success": true,
  "timestamp": "2025-10-07T09:00:00.000Z",
  "results": {
    "subscriptionNotifications": 5,
    "weddingReminders": 3,
    "taskReminders": 2,
    "totalNotificationsSent": 10,
    "totalNotificationsFailed": 0
  }
}
```

---

## 📊 **Notification Summary**

### **Current Implementation Status:**

| Feature                 | Status            | File                                           |
| ----------------------- | ----------------- | ---------------------------------------------- |
| Notification Service    | ✅ Complete       | `src/lib/notifications/notificationService.ts` |
| Unified Cron Job        | ✅ Complete       | `src/app/api/cron/notifications/route.ts`      |
| Task Completion         | ✅ Integrated     | `src/app/api/tasks/[token]/route.ts`           |
| RSVP Response           | ✅ Integrated     | `src/app/api/rsvp/[token]/route.ts`            |
| Subscription Expiration | ✅ Complete       | Handled by cron job                            |
| Wedding Date Reminders  | ✅ Complete       | Handled by cron job                            |
| Task Reminders          | ✅ Complete       | Handled by cron job (Mondays)                  |
| Guest Added             | ⏳ Template ready | Need to integrate in guest API                 |
| Gallery Upload          | ⏳ Template ready | Need to integrate in gallery API               |

---

## 🎯 **Benefits of This Architecture**

### **✅ Single Cron Job**

- One file to maintain
- Easy to add new scheduled notifications
- Centralized error handling
- Single endpoint to configure

### **✅ Reusable Service**

- Import anywhere: `import { sendNotificationToUser } from "@/lib/notifications"`
- Consistent notification format
- Pre-built templates
- Easy to extend

### **✅ Standard Practice**

- Event-driven for instant feedback
- Scheduled for periodic reminders
- Scalable architecture
- Easy debugging

### **✅ No Breaking Changes**

- All new files, no modifications to existing core logic
- Safe to deploy
- Can be tested independently
- Easy to rollback if needed

---

## 🔄 **Migration from Old Cron Job**

### **Old File (Can be removed):**

`src/app/api/cron/subscription-expiration-notifications/route.ts`

### **New File (Replaces it):**

`src/app/api/cron/notifications/route.ts`

### **What Changed:**

- ✅ All subscription logic preserved
- ✅ Added wedding reminders
- ✅ Added task reminders
- ✅ Better organized
- ✅ Single endpoint

### **To Migrate:**

1. Update cron configuration to point to `/api/cron/notifications`
2. Keep old file for 1-2 weeks as backup
3. Delete old file once confident new one works

---

## 🎉 **Summary**

**Notification System Complete!**

- ✅ **Instant notifications** for tasks & RSVP
- ✅ **Scheduled notifications** for subscriptions, weddings, tasks
- ✅ **Single cron job** managing all scheduled notifications
- ✅ **Scalable architecture** - easy to add more notification types
- ✅ **No breaking changes** - all additions, no modifications
- ✅ **Ready for production**

**Next:** Deploy and configure cron job! 🚀
