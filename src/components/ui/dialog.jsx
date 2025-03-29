import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  return open ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow">
        {children}
        <button onClick={() => onOpenChange(false)} className="mt-2 text-sm">Lukk</button>
      </div>
    </div>
  ) : null;
}

export function DialogContent({ children }) {
  return <div>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
