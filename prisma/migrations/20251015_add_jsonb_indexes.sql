-- Migration: add JSONB indexes for SecurityLog.metadata
-- Date: 2025-10-15
-- NOTE: Run this in your Postgres database (psql) or integrate into Prisma migrations.

-- Create a GIN index on metadata for general JSONB containment/search
CREATE INDEX IF NOT EXISTS idx_securitylog_metadata_gin ON "SecurityLog" USING GIN (metadata);

-- Create expression indexes for frequently queried keys to speed up ->> lookups
CREATE INDEX IF NOT EXISTS idx_securitylog_metadata_planid ON "SecurityLog" ((metadata ->> 'planId'));
CREATE INDEX IF NOT EXISTS idx_securitylog_metadata_adminid ON "SecurityLog" ((metadata -> 'admin' ->> 'id'));

-- Optional: index timestamp for faster ordering/filtering
CREATE INDEX IF NOT EXISTS idx_securitylog_timestamp ON "SecurityLog" ("timestamp" DESC);
