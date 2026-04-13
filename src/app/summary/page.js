'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  getCurrentMonth,
  shiftMonth,
  getDaysInMonth,
  formatINR,
  calculateSalary,
  pad,
} from '@/lib/helpers';
import Navbar from '@/components/Navbar';
import MonthNav from '@/components/MonthNav';
import { SummaryCardWithData } from '@/components/SummaryCard';
import EmptyState from '@/components/EmptyState';

export default function SummaryPage() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [absentMap, setAbsentMap] = useState({}); // { empId: ['2026-04-05', ...] }
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
      else setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setEmployees(data);
  }, []);

  // Fetch attendance for the current month
  const fetchAttendance = useCallback(async () => {
    const [y, m] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${month}-${pad(lastDay)}`;

    const { data } = await supabase
      .from('attendance')
      .select('employee_id, absent_date')
      .gte('absent_date', startDate)
      .lte('absent_date', endDate);

    if (data) {
      const map = {};
      data.forEach((row) => {
        if (!map[row.employee_id]) map[row.employee_id] = [];
        map[row.employee_id].push(row.absent_date);
      });
      setAbsentMap(map);
    }
    setLoading(false);
  }, [month]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetchEmployees();
      fetchAttendance();
    }
  }, [session, fetchEmployees, fetchAttendance]);

  const handleShift = (delta) => {
    setMonth((prev) => shiftMonth(prev, delta));
  };

  const totalDays = getDaysInMonth(month);
  const grandTotal = employees.reduce((sum, emp) => {
    const absentDates = absentMap[emp.id] || [];
    const summary = calculateSalary(emp, absentDates, totalDays);
    return sum + summary.netPayable;
  }, 0);

  if (!session) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content page-enter">
        <h1 className="page-title">Salary Summary</h1>
        <p className="page-subtitle">
          Monthly breakdown — show this to your employee at salary time
        </p>

        <MonthNav month={month} onShift={handleShift} />

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState icon="💰" message="No employees added yet." />
        ) : (
          <>
            {/* Grand total header */}
            <div className="summary-header">
              <div>
                <p className="small muted" style={{ marginBottom: '4px' }}>
                  Total payout this month
                </p>
                <p
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--teal)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatINR(grandTotal)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="small muted" style={{ marginBottom: '4px' }}>
                  Employees
                </p>
                <p
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {employees.length}
                </p>
              </div>
            </div>

            {/* Per-employee cards */}
            {employees.map((emp) => (
              <SummaryCardWithData
                key={emp.id}
                employee={emp}
                absentDates={absentMap[emp.id] || []}
                month={month}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
