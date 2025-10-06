# How to Run Grace Period Test Queries

## Option 1: Using Database GUI (Recommended)

### Tools you can use:

- **pgAdmin** - https://www.pgadmin.org/
- **DBeaver** - https://dbeaver.io/
- **TablePlus** - https://tableplus.com/
- **DataGrip** - https://www.jetbrains.com/datagrip/

### Steps:

1. Open your database tool
2. Connect using your `DATABASE_URL` from `.env`
3. Open `GRACE_PERIOD_TEST_QUERIES.sql`
4. Run each scenario query individually
5. Review results to verify the fix

---

## Option 2: Using psql Command Line

### On Windows (PowerShell):

```powershell
# First, get your database URL from .env
# It should look like: postgresql://user:password@host:5432/database

# Run psql and execute a query
psql "YOUR_DATABASE_URL" -c "SELECT u.id, u.email, u.isInGracePeriod FROM User u WHERE u.isInGracePeriod = true;"

# OR connect interactively and paste queries
psql "YOUR_DATABASE_URL"
# Then paste queries from the SQL file
```

### On Mac/Linux:

```bash
# Connect to database
psql $DATABASE_URL

# Then paste queries from GRACE_PERIOD_TEST_QUERIES.sql
```

---

## Option 3: Using Prisma Studio (Easiest for Quick Check)

```bash
# Open Prisma Studio
npx prisma studio

# Or if using pnpm
pnpm prisma studio
```

Then:

1. Navigate to the `User` table
2. Filter by `isInGracePeriod = true`
3. Check the `gracePeriodEnd` date
4. Navigate to `WeddingPage` table
5. Check `deleted_at` field

---

## Option 4: Create a Quick Test Endpoint (For Development)

You can create a temporary API endpoint to check the data:

**Create:** `src/app/api/admin/test-grace-period/route.ts`

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  // Query from SCENARIO 1
  const usersWithDeletedPages = await prisma.user.findMany({
    where: {
      isInGracePeriod: true,
    },
    include: {
      weddingPages: {
        select: {
          id: true,
          slug: true,
          deleted_at: true,
        },
      },
    },
  });

  const results = usersWithDeletedPages.map((user) => ({
    id: user.id,
    email: user.email,
    isInGracePeriod: user.isInGracePeriod,
    gracePeriodEnd: user.gracePeriodEnd,
    activePages: user.weddingPages.filter((p) => !p.deleted_at).length,
    deletedPages: user.weddingPages.filter((p) => p.deleted_at).length,
    totalPages: user.weddingPages.length,
  }));

  return NextResponse.json({
    timestamp: now.toISOString(),
    totalUsersInGracePeriod: results.length,
    usersWithNoActivePages: results.filter((r) => r.activePages === 0).length,
    results,
  });
}
```

Then visit: `http://localhost:3001/api/admin/test-grace-period`

---

## What to Check:

### ✅ **Good Signs (Fix is Working):**

- Users with `deleted_at IS NOT NULL` pages don't have `isInGracePeriod = true`
- Users with `gracePeriodEnd < NOW()` have `isInGracePeriod = false`
- No orphaned grace period flags

### ⚠️ **Bad Signs (Need to Run Cleanup):**

- Users with all pages deleted but still `isInGracePeriod = true`
- Users with `gracePeriodEnd` in the past but still `isInGracePeriod = true`

---

## Quick PowerShell Script to Test Connection

Save this as `test-db-connection.ps1`:

```powershell
# Load environment variables
$envFile = Get-Content .env
$dbUrl = ($envFile | Where-Object { $_ -match "^DATABASE_URL=" }) -replace "^DATABASE_URL=", ""

Write-Host "Testing database connection..." -ForegroundColor Yellow

try {
    # Extract connection details
    if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        $user = $matches[1]
        $host = $matches[3]
        $port = $matches[4]
        $database = $matches[5]

        Write-Host "Host: $host" -ForegroundColor Cyan
        Write-Host "Port: $port" -ForegroundColor Cyan
        Write-Host "Database: $database" -ForegroundColor Cyan
        Write-Host "User: $user" -ForegroundColor Cyan
        Write-Host "`nConnection string ready for psql!" -ForegroundColor Green
    }
} catch {
    Write-Host "Error parsing DATABASE_URL" -ForegroundColor Red
}
```

---

## After Testing, Do You Still Need the File?

### **Keep It If:**

- ✅ You want to periodically audit grace period data
- ✅ You're debugging grace period issues in the future
- ✅ You want to verify data integrity after deployment
- ✅ You need to clean up orphaned data

### **Delete It If:**

- ❌ You've verified everything works
- ❌ You don't plan to audit the data
- ❌ You want to keep the repo clean

### **My Recommendation:**

**KEEP IT** - It's a valuable diagnostic tool! Move it to a `scripts/` or `docs/` folder:

```
myweddingpage/
├── scripts/
│   └── database/
│       └── grace-period-diagnostics.sql
```

Or keep it in the root but rename to indicate it's for diagnostics:

```
GRACE_PERIOD_DIAGNOSTICS.sql
```

It's only ~10KB and could save you hours of debugging in the future!
