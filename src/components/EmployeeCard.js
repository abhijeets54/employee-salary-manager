'use client';

import { useState } from 'react';
import { formatINR } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';

export default function EmployeeCard({ employee, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState(employee.role || 'helper');
  const [worksSundays, setWorksSundays] = useState(employee.works_sundays || false);
  const [salary, setSalary] = useState(String(employee.salary));
  const [food, setFood] = useState(String(employee.food_allowance));
  const [sundayRate, setSundayRate] = useState(String(employee.sunday_rate || 0));
  const [saving, setSaving] = useState(false);

  const valid = name.trim() && salary && food && Number(salary) > 0 && Number(food) >= 0;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    const { error } = await supabase
      .from('employees')
      .update({
        name: name.trim(),
        role,
        salary: Number(salary),
        food_allowance: Number(food),
        works_sundays: worksSundays,
        sunday_rate: worksSundays ? (Number(sundayRate) || 0) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employee.id);

    if (!error) {
      onUpdate({
        ...employee,
        name: name.trim(),
        role,
        salary: Number(salary),
        food_allowance: Number(food),
        works_sundays: worksSundays,
        sunday_rate: worksSundays ? (Number(sundayRate) || 0) : 0,
      });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${employee.name}?\n\nThis will also delete all their attendance and deduction records.`)) return;
    const { error } = await supabase.from('employees').delete().eq('id', employee.id);
    if (!error) onDelete(employee.id);
  };

  const handleCancel = () => {
    setName(employee.name);
    setRole(employee.role || 'helper');
    setWorksSundays(employee.works_sundays || false);
    setSalary(String(employee.salary));
    setFood(String(employee.food_allowance));
    setSundayRate(String(employee.sunday_rate || 0));
    setEditing(false);
  };

  const sRate = Number(employee.sunday_rate) || 0;

  if (editing) {
    return (
      <div className="card card-highlight page-enter">
        <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '16px' }}>
          Edit employee
        </p>
        <label className="field-label">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee name"
          style={{ marginBottom: '16px' }}
        />
        
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label" style={{ marginBottom: '8px' }}>Role</label>
          <div className="deduction-type-toggle" style={{ marginBottom: 0 }}>
            <button
              className={`type-btn ${role === 'main' ? 'active' : ''}`}
              onClick={() => setRole('main')}
              style={{ padding: '8px 12px', minHeight: '38px' }}
            >
              👤 Main Worker
            </button>
            <button
              className={`type-btn ${role === 'helper' ? 'active' : ''}`}
              onClick={() => setRole('helper')}
              style={{ padding: '8px 12px', minHeight: '38px' }}
            >
              🛠️ Helper
            </button>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '12px' }}>
          <div>
            <label className="field-label">Fixed salary (₹/month)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 12000"
            />
          </div>
          <div>
            <label className="field-label">Food allowance (₹/day)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={food}
              onChange={(e) => setFood(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 100"
            />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: worksSundays ? '12px' : 0 }}>
            <input 
              type="checkbox" 
              checked={worksSundays} 
              onChange={(e) => setWorksSundays(e.target.checked)} 
              style={{ width: '18px', minHeight: '18px', margin: 0 }}
            />
            Works on Sundays?
          </label>
          {worksSundays && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sundayRate}
              onChange={(e) => setSundayRate(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Sunday bonus (e.g. 700)"
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" style={{ flex: 1 }} onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" style={{ flex: 1 }} disabled={!valid || saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card page-enter">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <p style={{ fontWeight: 600, margin: 0, fontSize: '16px' }}>
            {employee.name}
          </p>
          <span className={`deduction-type-badge ${employee.role === 'main' ? 'cash' : 'goods'}`} style={{ opacity: 0.8 }}>
            {employee.role === 'main' ? 'Main' : 'Helper'}
          </span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          {formatINR(employee.salary)}/month &nbsp;·&nbsp; {formatINR(employee.food_allowance)}/day food
          {employee.works_sundays && sRate > 0 && (
            <> &nbsp;·&nbsp; <span style={{ color: 'var(--teal)' }}>{formatINR(sRate)}/Sun</span></>
          )}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => setEditing(true)}>
          ✏️ Edit
        </button>
        <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}
