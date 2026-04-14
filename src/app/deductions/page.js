'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  getCurrentMonth,
  shiftMonth,
  getDaysInMonth,
  formatINR,
  formatDate,
  pad,
} from '@/lib/helpers';
import Navbar from '@/components/Navbar';
import MonthNav from '@/components/MonthNav';
import DeductionModal from '@/components/DeductionModal';
import EmptyState from '@/components/EmptyState';

export default function DeductionsPage() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [deductionMap, setDeductionMap] = useState({}); // { empId: [{ id, amount, reason, type, deduction_date }] }
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [modalEmployee, setModalEmployee] = useState(null); // employee object or null
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

  // Fetch deductions for the current month
  const fetchDeductions = useCallback(async () => {
    const [y, m] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${month}-${pad(lastDay)}`;

    const { data } = await supabase
      .from('deductions')
      .select('*')
      .gte('deduction_date', startDate)
      .lte('deduction_date', endDate)
      .order('deduction_date', { ascending: false });

    if (data) {
      const map = {};
      data.forEach((row) => {
        if (!map[row.employee_id]) map[row.employee_id] = [];
        map[row.employee_id].push(row);
      });
      setDeductionMap(map);
    }
    setLoading(false);
  }, [month]);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetchEmployees();
      fetchDeductions();
    }
  }, [session, fetchEmployees, fetchDeductions]);

  const handleShift = (delta) => {
    setMonth((prev) => shiftMonth(prev, delta));
  };

  const handleAddDeduction = (newDeduction) => {
    setDeductionMap((prev) => {
      const empId = newDeduction.employee_id;
      const existing = prev[empId] || [];
      return { ...prev, [empId]: [newDeduction, ...existing] };
    });
  };

  const handleDeleteDeduction = async (deductionId, employeeId) => {
    if (!confirm('Delete this entry?')) return;
    const { error } = await supabase.from('deductions').delete().eq('id', deductionId);
    if (!error) {
      setDeductionMap((prev) => {
        const existing = prev[employeeId] || [];
        return { ...prev, [employeeId]: existing.filter((d) => d.id !== deductionId) };
      });
    }
  };

  if (!session) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Grand total of all deductions this month
  const grandTotal = employees.reduce((sum, emp) => {
    const entries = deductionMap[emp.id] || [];
    return sum + entries.reduce((s, d) => s + Number(d.amount), 0);
  }, 0);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content page-enter">
        <h1 className="page-title">Deductions</h1>
        <p className="page-subtitle">
          Track cash & goods taken by employees — deducted from salary
        </p>

        <MonthNav month={month} onShift={handleShift} />

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState icon="🧾" message="Add employees first from the Employees tab." />
        ) : (
          <>
            {/* Total deductions this month */}
            {grandTotal > 0 && (
              <div className="deductions-total-banner">
                <span className="muted" style={{ fontSize: '13px' }}>Total deductions this month</span>
                <span className="coral-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  −{formatINR(grandTotal)}
                </span>
              </div>
            )}

            {/* Per-employee sections */}
            {employees.map((emp) => {
              const entries = deductionMap[emp.id] || [];
              const empTotal = entries.reduce((s, d) => s + Number(d.amount), 0);

              return (
                <div key={emp.id} className="card deduction-card page-enter">
                  <div className="deduction-card-header">
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>
                        {emp.name}
                      </p>
                      {empTotal > 0 && (
                        <p className="coral-text" style={{ fontSize: '13px', margin: '2px 0 0', fontWeight: 500 }}>
                          −{formatINR(empTotal)} this month
                        </p>
                      )}
                    </div>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => setModalEmployee(emp)}
                    >
                      + Add
                    </button>
                  </div>

                  {entries.length === 0 ? (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '8px' }}>
                      No deductions this month
                    </p>
                  ) : (
                    <div className="deduction-list">
                      {entries.map((d) => (
                        <div key={d.id} className="deduction-item">
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
                              <p className="deduction-item-reason">{d.reason}</p>
                            )}
                          </div>
                          <div className="deduction-item-right">
                            <span className="deduction-item-amount">
                              −{formatINR(d.amount)}
                            </span>
                            <button
                              className="deduction-delete-btn"
                              onClick={() => handleDeleteDeduction(d.id, emp.id)}
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
              );
            })}
          </>
        )}
      </div>

      {/* Modal */}
      {modalEmployee && (
        <DeductionModal
          employee={modalEmployee}
          month={month}
          onAdd={handleAddDeduction}
          onClose={() => setModalEmployee(null)}
        />
      )}
    </div>
  );
}
