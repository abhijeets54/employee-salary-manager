'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Sidebar({ employees = [], isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();

  const helpers = employees.filter((e) => e.role === 'helper');
  const mains = employees.filter((e) => e.role === 'main');

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (empId) => {
    router.push(`/profile/${empId}`);
    onClose();
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-title">
          <span>Views</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        </div>

        {mains.length > 0 && (
          <>
            <div className="sidebar-group-title">Main Workers</div>
            {mains.map((emp) => (
              <button
                key={emp.id}
                className={`sidebar-item ${pathname === `/profile/${emp.id}` ? 'active' : ''}`}
                onClick={() => handleSelect(emp.id)}
              >
                👤 {emp.name}
              </button>
            ))}
          </>
        )}

        {helpers.length > 0 && (
          <>
            <div className="sidebar-group-title">Helpers</div>
            {helpers.map((emp) => (
              <button
                key={emp.id}
                className={`sidebar-item ${pathname === `/profile/${emp.id}` ? 'active' : ''}`}
                onClick={() => handleSelect(emp.id)}
              >
                🛠️ {emp.name}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
