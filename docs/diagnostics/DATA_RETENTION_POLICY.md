# Grace Period Data Retention Policy

## Design Decision: Keep Historical Dates

**Date:** October 3, 2025
**Decision:** Keep `gracePeriodStart` and `gracePeriodEnd` dates after grace period ends

---

## ✅ What We Do

When a user's grace period ends and their pages are deleted:

```typescript
// Only reset the FLAG
isInGracePeriod: false  // ← Active status (matters for logic)

// Keep the DATES for historical record
gracePeriodStart: <original date>  // ← When grace period started
gracePeriodEnd: <original date>    // ← When grace period ended
```

---

## 🎯 Rationale

### Benefits of Keeping Dates:

1. **Audit Trail**
   - Know when each user went through grace period
   - Track compliance and user lifecycle
   - Support can verify historical events

2. **Analytics**
   - "How many users entered grace period this month?"
   - "Average time users spend in grace period before renewal"
   - "Conversion rate: grace period → renewal"

3. **Debugging**
   - "Did this user ever have a grace period?"
   - "When did their pages get deleted?"
   - Better troubleshooting with complete history

4. **Consistency**
   - Matches pattern with `deleted_at` in WeddingPage (soft delete)
   - Matches pattern with `subscription_end` (keeps history)
   - Consistent with `ExpirationLog` table

### The Flag is What Matters:

```typescript
// Logic always checks the FLAG first
if (user.isInGracePeriod === true) {
  // User is CURRENTLY in grace period
} else {
  // User is NOT in grace period (might have been before)
}

// Dates are just for reference/history
```

---

## 📊 Data States

### State 1: Never Had Grace Period

```typescript
isInGracePeriod: false;
gracePeriodStart: null;
gracePeriodEnd: null;
```

### State 2: Currently In Grace Period

```typescript
isInGracePeriod: true;
gracePeriodStart: "2025-10-01T08:00:00Z";
gracePeriodEnd: "2025-10-04T08:00:00Z";
```

### State 3: Grace Period Ended (Historical Record) ⭐ NEW

```typescript
isInGracePeriod: false;
gracePeriodStart: "2025-10-01T08:00:00Z"; // ← Kept for history
gracePeriodEnd: "2025-10-04T08:00:00Z"; // ← Kept for history
```

---

## 🔍 Query Patterns

### Check Current Status:

```typescript
// Always use the flag for logic
const usersInGracePeriod = await prisma.user.findMany({
  where: {
    isInGracePeriod: true, // ← This is what matters
  },
});
```

### Historical Analysis:

```typescript
// Use dates for analytics
const usersWhoWentThroughGracePeriod = await prisma.user.findMany({
  where: {
    gracePeriodStart: { not: null }, // Has historical data
  },
});
```

### Audit Specific User:

```typescript
// See complete lifecycle
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    isInGracePeriod: true, // Current status
    gracePeriodStart: true, // When it started
    gracePeriodEnd: true, // When it ended
    subscription_end: true, // When plan expired
  },
});

// Example output:
// {
//   isInGracePeriod: false,
//   gracePeriodStart: "2025-09-30T08:24:02Z",
//   gracePeriodEnd: "2025-10-03T08:24:02Z",
//   subscription_end: "2025-09-19T18:56:24Z"
// }
//
// Tells the story: Plan expired Sept 19, grace period Sept 30 - Oct 3
```

---

## 🛡️ Database Integrity

### Constraints:

- `isInGracePeriod` is the source of truth for CURRENT status
- `gracePeriodStart/End` are immutable once set (never cleared)
- Dates without flag (`isInGracePeriod: false`) = historical record

### Valid Combinations:

| isInGracePeriod | gracePeriodStart | gracePeriodEnd | Meaning                        |
| --------------- | ---------------- | -------------- | ------------------------------ |
| `false`         | `null`           | `null`         | Never had grace period         |
| `true`          | `date`           | `future date`  | Currently in grace period      |
| `false`         | `date`           | `past date`    | Had grace period, now ended ⭐ |

### Invalid Combinations:

| isInGracePeriod | gracePeriodStart | gracePeriodEnd | Why Invalid                            |
| --------------- | ---------------- | -------------- | -------------------------------------- |
| `true`          | `null`           | `null`         | Can't be in grace period without dates |
| `false`         | `null`           | `date`         | Can't have end without start           |

---

## 🔧 Implementation

### Files Updated:

1. `src/app/api/cron/expiration-manager/route.ts` (line ~410)
2. `src/app/api/cleanup-grace-period-flags/route.ts` (line ~70)

### Code Pattern:

```typescript
// When grace period ends, only reset the flag
await prisma.user.update({
  where: { id: user.id },
  data: {
    isInGracePeriod: false, // ← Only this changes
    // gracePeriodStart and gracePeriodEnd remain unchanged
  },
});
```

---

## 📈 Future Analytics Possibilities

With historical dates, you can analyze:

```sql
-- Users who completed grace period without renewing
SELECT COUNT(*)
FROM "User"
WHERE "isInGracePeriod" = false
  AND "gracePeriodEnd" IS NOT NULL;

-- Average grace period duration
SELECT AVG(EXTRACT(EPOCH FROM ("gracePeriodEnd" - "gracePeriodStart"))/86400) as avg_days
FROM "User"
WHERE "gracePeriodStart" IS NOT NULL;

-- Grace period conversion rate (if they renewed)
SELECT
  COUNT(*) FILTER (WHERE "subscription_end" > "gracePeriodEnd") as renewed,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE "subscription_end" > "gracePeriodEnd") / COUNT(*), 2) as conversion_rate
FROM "User"
WHERE "gracePeriodEnd" IS NOT NULL;
```

---

## 🔄 Migration Note

**No migration needed!** This is a policy change:

- Old data: May have `null` dates (already cleaned up)
- New data: Will keep dates (as of Oct 3, 2025)
- Both valid states coexist fine

---

## 📝 Summary

**Decision:** Keep dates, reset flag only
**Rationale:** Audit trail, analytics, debugging
**Pattern:** Consistent with soft delete and other historical fields
**Impact:** Better long-term data integrity with no downside

---

**Updated:** October 3, 2025
**Status:** ✅ Implemented in cleanup route and cron job
