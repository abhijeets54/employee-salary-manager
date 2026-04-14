'use client';

import { useState } from 'react';
import { formatINR } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';

export default function EmployeeCard({ employee, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(employee.name);
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
        salary: Number(salary),
        food_allowance: Number(food),
        sunday_rate: Number(sundayRate) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employee.id);

    if (!error) {
      onUpdate({
        ...employee,
        name: name.trim(),
        salary: Number(salary),
        food_allowance: Number(food),
        sunday_rate: Number(sundayRate) || 0,
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
          style={{ marginBottom: '12px' }}
        />
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
          <label className="field-label">Sunday bonus (₹/Sunday)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={sundayRate}
            onChange={(e) => setSundayRate(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="0 = no Sunday bonus"
          />
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
        <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '16px' }}>
          {employee.name}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          {formatINR(employee.salary)}/month &nbsp;·&nbsp; {formatINR(employee.food_allowance)}/day food
          {sRate > 0 && (
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
