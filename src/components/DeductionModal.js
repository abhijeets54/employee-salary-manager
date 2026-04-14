'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTodayStr } from '@/lib/helpers';

export default function DeductionModal({ employee, month, onAdd, onClose }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('cash');
  const [date, setDate] = useState(getTodayStr());
  const [saving, setSaving] = useState(false);

  const valid = amount && Number(amount) > 0;

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('deductions')
      .insert({
        employee_id: employee.id,
        amount: Number(amount),
        reason: reason.trim(),
        type,
        deduction_date: date,
      })
      .select()
      .single();

    if (!error && data) {
      onAdd(data);
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content page-enter" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Deduction</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          For <strong>{employee.name}</strong>
        </p>

        {/* Type toggle */}
        <div className="deduction-type-toggle">
          <button
            className={`type-btn ${type === 'cash' ? 'active' : ''}`}
            onClick={() => setType('cash')}
          >
            💵 Cash
          </button>
          <button
            className={`type-btn ${type === 'goods' ? 'active' : ''}`}
            onClick={() => setType('goods')}
          >
            📦 Goods / Samaan
          </button>
        </div>

        {/* Amount — mandatory */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label">Amount (₹) *</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 1450"
            autoFocus
          />
        </div>

        {/* Reason — optional */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label">
            Reason {type === 'goods' ? '' : '(optional)'}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={type === 'goods' ? 'e.g. kapda lai gya' : 'e.g. Sunday cash'}
            autoComplete="off"
          />
        </div>

        {/* Date */}
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!valid || saving}
            onClick={handleSubmit}
          >
            {saving ? 'Saving...' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
