'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmployeeForm({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [food, setFood] = useState('');
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
        salary: Number(salary),
        food_allowance: Number(food),
        sunday_rate: Number(sundayRate) || 0,
      })
      .select()
      .single();

    if (!error && data) {
      onAdd(data);
      setName('');
      setSalary('');
      setFood('');
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
        <label className="field-label">Sunday bonus (₹/Sunday) — leave empty if none</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={sundayRate}
          onChange={(e) => setSundayRate(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="e.g. 700 (0 = no Sunday bonus)"
        />
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
