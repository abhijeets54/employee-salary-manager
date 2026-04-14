-- ============================================================
-- MIGRATION: Add Sunday Bonus and Deductions
-- Run these commands in your Supabase SQL Editor
-- ============================================================

-- Step 1: Add sunday_rate to existing employees
-- (Defaults to 0 so existing employees don't get arbitrary bonuses)
ALTER TABLE employees ADD COLUMN sunday_rate NUMERIC NOT NULL DEFAULT 0;

-- Step 2: Create the deductions table for cash and goods advances
CREATE TABLE deductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('cash', 'goods')),
  deduction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Create indexes for fast lookups
CREATE INDEX idx_deductions_employee ON deductions(employee_id);
CREATE INDEX idx_deductions_date ON deductions(deduction_date);

-- Step 4: Enable Row Level Security (RLS) and grant auth access
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on deductions"
  ON deductions FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
