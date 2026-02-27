import React from 'react';

export default function EmptyShelf({ onAddClick }) {
  return (
    <div className="empty-state" style={{ marginTop: '60px' }}>
      <div className="empty-glyph" style={{ animation: 'pulse 3s infinite', color: 'var(--rust)' }}>◈</div>
      <div className="empty-title" style={{ fontStyle: 'normal', fontSize: '24px', color: 'var(--text-primary)' }}>
        Welcome to your shelf
      </div>
      <div className="empty-sub" style={{ maxWidth: '320px', margin: '0 auto 24px', lineHeight: '1.6' }}>
        Log what your first 3 books did to you to unlock your unique Reading DNA profile.
      </div>
      <button 
        className="add-btn" 
        onClick={onAddClick} 
        style={{ fontSize: '14px', padding: '12px 28px' }}
      >
        + Add Your First Book
      </button>
    </div>
  );
}