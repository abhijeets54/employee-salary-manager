'use client';

import { getMonthLabel } from '@/lib/helpers';

export default function MonthNav({ month, onShift }) {
  return (
    <div className="month-nav">
      <button
        className="btn-icon"
        onClick={() => onShift(-1)}
        aria-label="Previous month"
      >
        ←
      </button>
      <span className="month-nav-label">{getMonthLabel(month)}</span>
      <button
        className="btn-icon"
        onClick={() => onShift(1)}
        aria-label="Next month"
      >
        →
      </button>
    </div>
  );
}
