# Quick Testing Guide - Grace Period Fix

## 🚀 EASIEST METHOD: Use the Test Endpoint

I've created a simple API endpoint for you to test without needing database tools!

### Steps:

1. **Make sure your dev server is running:**

   ```powershell
   pnpm dev
   ```

2. **Open your browser or use curl:**

   ```
   http://localhost:3001/api/test-grace-period-diagnostic
   ```

   Or with PowerShell:

   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3001/api/test-grace-period-diagnostic" | ConvertTo-Json -Depth 10
   ```

   **Note:** This endpoint is unprotected (no admin login required) for easy testing.
   The admin-protected version is at `/api/admin/test-grace-period` if you need it later.

3. **Check the results:**
   - ✅ **If `fixWorking: true`** - Everything is good! No issues found.
   - ⚠️ **If `fixWorking: false`** - Check the scenarios for details

### What to Look For:

```json
{
  "summary": {
    "totalUsersInGracePeriod": 5,
    "usersWhoShouldReceiveEmails": 3,
    "usersWithOrphanedFlags": 0, // ← Should be 0
    "usersWithNoActivePages": 0 // ← Should be 0
  },
  "status": {
    "fixWorking": true, // ← Should be true
    "message": "✅ Fix is working!"
  }
}
```

### Good Results (Fix Working):

- `usersWithOrphanedFlags: 0` ✅
- `usersWithNoActivePages: 0` ✅
- `fixWorking: true` ✅

### Bad Results (Need Attention):

- `usersWithOrphanedFlags: > 0` ⚠️ - Users with expired grace period but flags not reset
- `usersWithNoActivePages: > 0` ⚠️ - Users with deleted pages still in grace period

---

## After Testing

### Option 1: Keep the Files (Recommended)

These files are useful for future diagnostics:

- `GRACE_PERIOD_TEST_QUERIES.sql` - Database queries
- `src/app/api/admin/test-grace-period/route.ts` - API endpoint
- `RUN_TEST_QUERIES.md` - This guide

**Move them to a safe place:**

```
myweddingpage/
├── docs/
│   └── diagnostics/
│       ├── GRACE_PERIOD_TEST_QUERIES.sql
│       └── RUN_TEST_QUERIES.md
└── src/app/api/admin/
    └── test-grace-period/  (keep for future use)
```

### Option 2: Delete After Verification

If everything works perfectly and you don't need them:

```powershell
# Delete the test endpoint
Remove-Item -Path "src/app/api/admin/test-grace-period" -Recurse

# Delete the SQL file (optional)
Remove-Item -Path "GRACE_PERIOD_TEST_QUERIES.sql"

# Delete this guide (optional)
Remove-Item -Path "RUN_TEST_QUERIES.md"
```

---

## My Recommendation

**KEEP THEM** in a `docs/` folder! They're valuable for:

- Future debugging
- Periodic health checks
- Verifying after deployments
- Training new developers

Total size: ~15KB (negligible)
Time saved in future: Hours!

---

## Next Steps

1. ✅ Test using the endpoint: `http://localhost:3001/api/admin/test-grace-period`
2. ✅ Verify `fixWorking: true`
3. ✅ Check the production database before/after cron runs
4. ✅ Monitor logs for `[GRACE PERIOD]` entries
5. ✅ Deploy to production with confidence!

---

## Quick PowerShell Commands

```powershell
# Test the endpoint (unprotected - no login needed)
curl http://localhost:3001/api/test-grace-period-diagnostic

# Or with better formatting
Invoke-RestMethod http://localhost:3001/api/test-grace-period-diagnostic | ConvertTo-Json -Depth 5

# If you're logged in as admin, you can also use:
# curl http://localhost:3001/api/admin/test-grace-period

# Check if dev server is running
Get-Process -Name node -ErrorAction SilentlyContinue

# Start dev server if not running
pnpm dev
```

That's it! Super simple. 🎉
