-- ============================================================
-- MIGRATION V2: Add Employee Roles and Sunday Working flag
-- Run these commands in your Supabase SQL Editor
-- ============================================================

-- Step 1: Add role column to determine if they are a main worker or a helper
-- (Defaults to 'helper' so existing employees don't break)
ALTER TABLE employees ADD COLUMN role TEXT NOT NULL DEFAULT 'helper' CHECK (role IN ('main', 'helper'));

-- Step 2: Add checkbox flag for working on Sundays
-- (Defaults to false so existing employees don't get arbitrary bonuses)
ALTER TABLE employees ADD COLUMN works_sundays BOOLEAN NOT NULL DEFAULT false;
