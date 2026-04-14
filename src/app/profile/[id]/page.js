'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentMonth, shiftMonth, formatDate, formatINR, pad } from '@/lib/helpers';
import Navbar from '@/components/Navbar';
import MonthNav from '@/components/MonthNav';
import { SummaryCardWithData } from '@/components/SummaryCard';
import AttendanceGrid from '@/components/AttendanceGrid';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [absentMap, setAbsentMap] = useState({});
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth & Base Fetching
    const fetchBase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         router.push('/login');
         return;
      }
      
      const { data: emps } = await supabase.from('employees').select('*').order('created_at', { ascending: true });
      if (emps) {
        setAllEmployees(emps);
        const currentEmp = emps.find(e => e.id === id);
        if (currentEmp) setEmployee(currentEmp);
      }
      setLoading(false);
    };
    fetchBase();
  }, [id, router]);

  useEffect(() => {
    if (!id || !month) return;
    const fetchRecords = async () => {
      // 1. Fetch attendance
      const { data: attData } = await supabase
        .from('attendance')
        .select('absent_date')
        .eq('employee_id', id)
        .like('absent_date', `${month}-%`);
      
      const abSet = new Set((attData || []).map(a => a.absent_date));
      setAbsentMap({ [id]: abSet });
      
      // 2. Fetch deductions
      const [y, m] = month.split('-').map(Number);
      const startDate = `${month}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const endDate = `${month}-${pad(lastDay)}`;
  
      const { data: dedData } = await supabase
        .from('deductions')
        .select('*')
        .eq('employee_id', id)
        .gte('deduction_date', startDate)
        .lte('deduction_date', endDate)
        .order('deduction_date', { ascending: false });
        
      setDeductions(dedData || []);
    };
    fetchRecords();
  }, [id, month]);

  const handleDeleteDeduction = async (d) => {
    if (!confirm('Delete this deduction?')) return;
    const { error } = await supabase.from('deductions').delete().eq('id', d.id);
    if (!error) {
      setDeductions(prev => prev.filter(item => item.id !== d.id));
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!employee) {
    return (
      <div className="app-shell">
        <Navbar employees={allEmployees} />
        <div className="app-content page-enter">
          <p>Employee not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar employees={allEmployees} />
      <div className="app-content page-enter" style={{ paddingBottom: '90px' }}>
        
        {/* Profile Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-sm" onClick={() => router.back()} style={{ minWidth: '40px', padding: '0 8px' }}>←</button>
          <h1 className="page-title" style={{ margin: 0, border: 'none', padding: 0 }}>{employee.name}'s Profile</h1>
          <span className={`deduction-type-badge ${employee.role === 'main' ? 'cash' : 'goods'}`} style={{ marginLeft: 'auto' }}>
            {employee.role === 'main' ? 'Main Worker' : 'Helper'}
          </span>
        </div>

        <MonthNav month={month} onShift={(delta) => setMonth(prev => shiftMonth(prev, delta))} />
        
        <SummaryCardWithData
            employee={employee}
            absentDates={Array.from(absentMap[employee.id] || [])}
            month={month}
            deductions={deductions}
        />

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Attendance Tracker</h2>
          <AttendanceGrid employees={[employee]} month={month} absentMap={absentMap} setAbsentMap={setAbsentMap} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Deductions History</h2>
          {deductions.length === 0 ? (
            <p className="muted" style={{ fontSize: '14px' }}>No deductions this month.</p>
          ) : (
            <div className="deduction-list" style={{ marginTop: '12px' }}>
              {deductions.map((d) => (
                <div key={d.id} className="deduction-item card" style={{ padding: '12px' }}>
                  <div className="deduction-item-info">
                    <div className="deduction-item-top">
                      <span className={`deduction-type-badge ${d.type}`}>
                        {d.type === 'cash' ? '💵' : '📦'} {d.type}
                      </span>
                      <span className="deduction-item-date">
                        {formatDate(d.deduction_date)}
                      </span>
                    </div>
                    {d.reason && (
                      <p className="deduction-item-reason" style={{ margin: '6px 0 0' }}>{d.reason}</p>
                    )}
                  </div>
                  <div className="deduction-item-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="deduction-item-amount coral-text" style={{ fontWeight: 600 }}>
                      −{formatINR(d.amount)}
                    </span>
                    <button
                      className="deduction-delete-btn"
                      onClick={() => handleDeleteDeduction(d)}
                      aria-label="Delete"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
