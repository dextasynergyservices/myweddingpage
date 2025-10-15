-- Migration: add AdminSelection table

CREATE TABLE IF NOT EXISTS "AdminSelection" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AdminSelection_adminId_idx" ON "AdminSelection" ("adminId");
