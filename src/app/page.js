'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmployeeCard from '@/components/EmployeeCard';
import EmployeeForm from '@/components/EmployeeForm';
import EmptyState from '@/components/EmptyState';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setSession(session);
      }
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
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setEmployees(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) fetchEmployees();
  }, [session, fetchEmployees]);

  const handleAdd = (newEmp) => {
    setEmployees((prev) => [...prev, newEmp]);
    setShowForm(false);
  };

  const handleUpdate = (updatedEmp) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
  };

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
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
      <Navbar employees={employees} />
      <div className="app-content page-enter">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">
          Manage your team — add employees with their salary and food allowance
        </p>

        {showForm && (
          <EmployeeForm onAdd={handleAdd} onClose={() => setShowForm(false)} />
        )}

        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </span>
          {/* Desktop inline button */}
          {!showForm && (
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
              style={{ display: 'none' }}
              id="add-desktop-btn"
            >
              + Add employee
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : employees.length === 0 && !showForm ? (
          <EmptyState
            icon="👤"
            message="No employees yet. Tap the + button to add your first employee."
          />
        ) : (
          employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* FAB for adding employee (works on all screens) */}
      {!showForm && (
        <button
          className="fab"
          onClick={() => {
            setShowForm(true);
            // Scroll to top to show the form
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Add employee"
        >
          +
        </button>
      )}

      {/* Desktop add button shown via CSS */}
      <style jsx>{`
        @media (min-width: 641px) {
          #add-desktop-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
