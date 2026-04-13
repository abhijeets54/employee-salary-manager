# Supabase Setup Guide

## 1. Create Project
- Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- New Project → Name: `salary-manager`, Region: closest to you
- Wait for provisioning (~2 min)

## 2. Run SQL Schema
Go to **SQL Editor** → New Query → paste and run:

```sql
-- Employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  food_allowance NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance table (stores only absent days)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  absent_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, absent_date)
);

-- Indexes
CREATE INDEX idx_attendance_date ON attendance(absent_date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);

-- RLS policies (allow authenticated users full access)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth full access on employees"
  ON employees FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Auth full access on attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## 3. Create Login User
- **Authentication** → **Users** → **Add User** → **Create New User**
- Enter email + password, check **Auto Confirm User**
- This is your app login

## 4. Get API Keys
- **Settings** → **API**
- Copy **Project URL** and **anon public** key

## 5. Update `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 6. Test
```bash
cd e:\Downloads\employee-salary-manager\app
npm run dev
```
Open http://localhost:3000 → login with the user you created in step 3.

---

## Table Schema Reference

### `employees`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated PK |
| name | TEXT | Employee name |
| salary | NUMERIC | Fixed monthly salary (₹) |
| food_allowance | NUMERIC | Daily food allowance (₹) |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `attendance`
| Column | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated PK |
| employee_id | UUID | FK → employees.id (CASCADE delete) |
| absent_date | DATE | The date employee was absent |
| created_at | TIMESTAMPTZ | Auto |

**Unique constraint**: `(employee_id, absent_date)` — one record per employee per day.

### Salary Formula
```
Net Payable = Fixed Salary + (Food Allowance × Days Present)
Days Present = Total Days in Month − Absent Days
```
Fixed salary is never cut. Only food allowance is deducted for absent days.
