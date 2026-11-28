import type { CSSProperties } from 'react';

export const sampleBadge: CSSProperties = {
  display: 'inline-block',
  padding: '0.1rem 0.5rem',
  borderRadius: 4,
  background: '#fef3c7',
  color: '#78350f',
  border: '1px solid #f59e0b',
  fontSize: '0.8rem',
  fontWeight: 600,
  verticalAlign: 'middle'
};

export const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' };
export const cell: CSSProperties = { textAlign: 'left', padding: '0.4rem 0.5rem', borderBottom: '1px solid #e2e8f0' };
export const headCell: CSSProperties = { ...cell, borderBottom: '2px solid #94a3b8' };
export const muted: CSSProperties = { color: '#64748b' };

export const slot: CSSProperties = {
  border: '1px dashed #94a3b8',
  borderRadius: 6,
  padding: '0.5rem 0.75rem',
  margin: '0.5rem 0',
  color: '#64748b'
};
