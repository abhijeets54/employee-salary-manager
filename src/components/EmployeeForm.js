'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmployeeForm({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [food, setFood] = useState('');
  const [role, setRole] = useState('helper');
  const [worksSundays, setWorksSundays] = useState(false);
  const [sundayRate, setSundayRate] = useState('');
  const [saving, setSaving] = useState(false);

  const valid = name.trim() && salary && food && Number(salary) > 0 && Number(food) >= 0;

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: name.trim(),
        role,
        salary: Number(salary),
        food_allowance: Number(food),
        works_sundays: worksSundays,
        sunday_rate: worksSundays ? (Number(sundayRate) || 0) : 0,
      })
      .select()
      .single();

    if (!error && data) {
      onAdd(data);
      setName('');
      setSalary('');
      setFood('');
      setRole('helper');
      setWorksSundays(false);
      setSundayRate('');
    }
    setSaving(false);
  };

  return (
    <div className="card card-highlight page-enter" style={{ marginBottom: '16px' }}>
      <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '16px' }}>
        Add new employee
      </p>
      <label className="field-label">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Employee name"
        style={{ marginBottom: '12px' }}
        autoFocus
        autoComplete="off"
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
        <button className="btn" style={{ flex: 1 }} onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button className="btn-primary" style={{ flex: 1 }} disabled={!valid || saving} onClick={handleSubmit}>
          {saving ? 'Adding...' : '+ Add employee'}
        </button>
      </div>
    </div>
  );
}
