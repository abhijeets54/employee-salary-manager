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

-- 3. Indexes for fast queries
CREATE INDEX idx_attendance_date ON attendance(absent_date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);

-- 4. Disable RLS for prototype (single user, no multi-tenancy)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

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
