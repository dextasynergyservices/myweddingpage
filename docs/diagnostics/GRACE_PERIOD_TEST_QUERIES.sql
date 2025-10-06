-- Test Script: Verify Grace Period Email Fix
-- Run this in your PostgreSQL database to test the scenarios

-- =====================================================
-- SCENARIO 1: Verify users with deleted pages are excluded
-- =====================================================

-- Check users who have isInGracePeriod=true but all pages are deleted
SELECT 
    u.id,
    u.email,
    u."groomName",
    u."isInGracePeriod",
    u."gracePeriodEnd",
    COUNT(CASE WHEN wp.deleted_at IS NULL THEN 1 END) as active_pages,
    COUNT(wp.id) as total_pages
FROM "User" u
LEFT JOIN "WeddingPage" wp ON wp."userId" = u.id
WHERE u."isInGracePeriod" = true
GROUP BY u.id, u.email, u."groomName", u."isInGracePeriod", u."gracePeriodEnd"
HAVING COUNT(CASE WHEN wp.deleted_at IS NULL THEN 1 END) = 0;

-- Expected: These users should NOT receive grace period emails
-- If this query returns results, those users would have been getting emails before the fix

-- =====================================================
-- SCENARIO 2: Verify correct grace period reminder query
-- =====================================================

-- This mimics the new query logic from the cron job
SELECT 
    u.id,
    u.email,
    u."groomName",
    u."brideName",
    u."isInGracePeriod",
    u."gracePeriodEnd",
    CEIL(EXTRACT(EPOCH FROM (u."gracePeriodEnd" - NOW())) / 86400) as days_left,
    COUNT(wp.id) as active_pages
FROM "User" u
INNER JOIN "WeddingPage" wp ON wp."userId" = u.id AND wp.deleted_at IS NULL
WHERE 
    u."isInGracePeriod" = true
    AND u."gracePeriodEnd" > NOW()
GROUP BY u.id, u.email, u."groomName", u."brideName", u."isInGracePeriod", u."gracePeriodEnd"
ORDER BY u."gracePeriodEnd" ASC;

-- Expected: Only users with active pages in valid grace periods
-- Days_left should be 1, 2, or 3 for them to receive emails

-- =====================================================
-- SCENARIO 3: Find orphaned grace period flags
-- =====================================================

-- Find users with grace period flags but no pages or all deleted pages
SELECT 
    u.id,
    u.email,
    u."isInGracePeriod",
    u."gracePeriodStart",
    u."gracePeriodEnd",
    u."subscription_end",
    COUNT(wp.id) FILTER (WHERE wp.deleted_at IS NULL) as active_pages,
    COUNT(wp.id) as total_pages
FROM "User" u
LEFT JOIN "WeddingPage" wp ON wp."userId" = u.id
WHERE 
    u."isInGracePeriod" = true
    AND u."gracePeriodEnd" < NOW()
GROUP BY u.id;

-- Expected: These are users whose grace period has ended
-- They should have isInGracePeriod reset to false
-- If this returns results, the cron job may need to run to clean them up

-- =====================================================
-- SCENARIO 4: Audit grace period timeline
-- =====================================================

-- View the grace period lifecycle for users
SELECT 
    u.id,
    u.email,
    u."groomName",
    u."subscription_end" as plan_expired,
    u."gracePeriodStart" as grace_started,
    u."gracePeriodEnd" as grace_ends,
    u."isInGracePeriod",
    CASE 
        WHEN u."gracePeriodEnd" IS NULL THEN 'No Grace Period'
        WHEN u."gracePeriodEnd" < NOW() THEN 'Grace Period Ended'
        WHEN u."gracePeriodEnd" > NOW() THEN 'In Grace Period'
    END as grace_status,
    CEIL(EXTRACT(EPOCH FROM (u."gracePeriodEnd" - NOW())) / 86400) as days_left,
    COUNT(wp.id) FILTER (WHERE wp.deleted_at IS NULL) as active_pages,
    COUNT(wp.id) FILTER (WHERE wp.deleted_at IS NOT NULL) as deleted_pages
FROM "User" u
LEFT JOIN "WeddingPage" wp ON wp."userId" = u.id
WHERE 
    u."gracePeriodStart" IS NOT NULL
    OR u."isInGracePeriod" = true
GROUP BY u.id, u.email, u."groomName", u."subscription_end", u."gracePeriodStart", u."gracePeriodEnd", u."isInGracePeriod"
ORDER BY u."gracePeriodEnd" DESC NULLS LAST;

-- =====================================================
-- SCENARIO 5: Cleanup orphaned flags (ADMIN ONLY - USE WITH CAUTION)
-- =====================================================

-- This will reset grace period flags for users whose grace period has ended
-- but flags weren't reset (orphaned data)
-- UNCOMMENT AND RUN ONLY IF NEEDED:

/*
UPDATE "User"
SET 
    "isInGracePeriod" = false,
    "gracePeriodStart" = NULL,
    "gracePeriodEnd" = NULL
WHERE 
    "isInGracePeriod" = true
    AND "gracePeriodEnd" < NOW()
    AND id IN (
        SELECT u.id 
        FROM "User" u
        LEFT JOIN "WeddingPage" wp ON wp."userId" = u.id AND wp.deleted_at IS NULL
        WHERE u."isInGracePeriod" = true
        GROUP BY u.id
        HAVING COUNT(wp.id) = 0
    );
*/

-- =====================================================
-- SCENARIO 6: Email history check (for ExpirationLog)
-- =====================================================

-- View expiration logs to see when grace periods were activated
SELECT 
    el.id,
    el."userId",
    u.email,
    u."groomName",
    el."expiredAt",
    el."subscriptionEnd",
    u."gracePeriodEnd",
    u."isInGracePeriod",
    EXTRACT(DAY FROM (NOW() - el."expiredAt")) as days_since_expiration
FROM "ExpirationLog" el
JOIN "User" u ON u.id = el."userId"
ORDER BY el."expiredAt" DESC
LIMIT 50;

-- =====================================================
-- EXPECTED OUTCOMES AFTER FIX
-- =====================================================

/*
BEFORE FIX:
- SCENARIO 1: May return users (they were getting emails incorrectly)
- SCENARIO 3: May have orphaned flags

AFTER FIX:
- SCENARIO 1: Should return 0 rows (no users with deleted pages receiving emails)
- SCENARIO 2: Only shows users who should receive emails (active pages + valid grace period)
- SCENARIO 3: Flags properly reset after deletion
- SCENARIO 4: Clear lifecycle view with proper states
- Email schedule: Users receive emails on Day 3, Day 2, Day 1 (not just Day 2 and Day 1)

KEY VERIFICATION POINTS:
✓ Users with deleted_at != NULL pages don't receive emails
✓ isInGracePeriod properly set to false after deletion
✓ Emails sent on all 3 days: [3, 2, 1] days left
✓ Proper logging in application with [GRACE PERIOD] prefix
*/
