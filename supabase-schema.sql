-- ============================================================
-- Employee Salary Manager — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  food_allowance NUMERIC NOT NULL,
  sunday_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Attendance table (stores only absent days)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  absent_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, absent_date)
);

-- 3. Deductions table (cash advances & goods taken)
CREATE TABLE deductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('cash', 'goods')),
  deduction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for fast queries
CREATE INDEX idx_attendance_date ON attendance(absent_date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_deductions_employee ON deductions(employee_id);
CREATE INDEX idx_deductions_date ON deductions(deduction_date);

-- 5. Disable RLS for prototype (single user, no multi-tenancy)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Authenticated users can do everything on employees"
  ON employees FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on deductions"
  ON deductions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- MIGRATION: Run these if tables already exist
-- ============================================================
-- ALTER TABLE employees ADD COLUMN sunday_rate NUMERIC NOT NULL DEFAULT 0;
--
-- CREATE TABLE deductions ( ... );  -- copy from above
-- CREATE INDEX idx_deductions_employee ON deductions(employee_id);
-- CREATE INDEX idx_deductions_date ON deductions(deduction_date);
-- ALTER TABLE deductions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated users can do everything on deductions"
--   ON deductions FOR ALL TO authenticated USING (true) WITH CHECK (true);
