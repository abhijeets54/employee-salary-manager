'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getCurrentMonth, shiftMonth, pad } from '@/lib/helpers';
import Navbar from '@/components/Navbar';
import MonthNav from '@/components/MonthNav';
import AttendanceGrid from '@/components/AttendanceGrid';
import EmptyState from '@/components/EmptyState';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [absentMap, setAbsentMap] = useState({}); // { empId: Set<'YYYY-MM-DD'> }
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
        if (!map[row.employee_id]) map[row.employee_id] = new Set();
        map[row.employee_id].add(row.absent_date);
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
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">
          Tap a cell to mark absent · All 7 days are working days
        </p>

        <MonthNav month={month} onShift={handleShift} />

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon="📋"
            message="Add employees first from the Employees tab."
          />
        ) : (
          <AttendanceGrid
            employees={employees}
            month={month}
            absentMap={absentMap}
            setAbsentMap={setAbsentMap}
          />
        )}
      </div>
    </div>
  );
}
