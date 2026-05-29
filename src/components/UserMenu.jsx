import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function UserMenu({ onSave, onLoad }) {
  const { user, logout, getAvatar } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const avatar = getAvatar(user);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all duration-200"
        style={{
          background: avatar.gradient,
          border: '2.5px solid rgba(255,255,255,0.3)',
          boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.2), 3px 3px 8px rgba(0,0,0,0.1)',
        }}
        title={user}
      >
        {avatar.initial}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-56 animate-scale-in z-50"
          style={{ transformOrigin: 'top right' }}
        >
          <div
            className="p-2 space-y-0.5"
            style={{
              background: 'var(--clay-surface)',
              border: '2.5px solid var(--clay-border-strong)',
              borderRadius: 'var(--radius-clay)',
              boxShadow: 'var(--shadow-clay-xl)',
            }}
          >
            {/* User info */}
            <div className="px-3 py-2.5 rounded-2xl" style={{ background: 'var(--clay-surface-alt)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>已登录</p>
            </div>

            <div style={{ borderTop: '2px solid var(--clay-border)', margin: '0.25rem 0' }} />

            {/* Save */}
            <button
              onClick={() => { setOpen(false); onSave?.(); }}
              className="w-full text-left px-3 py-2.5 rounded-2xl text-sm cursor-pointer transition-colors duration-150 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--clay-surface-alt)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              保存当前分析结果
            </button>

            {/* Load */}
            <button
              onClick={() => { setOpen(false); onLoad?.(); }}
              className="w-full text-left px-3 py-2.5 rounded-2xl text-sm cursor-pointer transition-colors duration-150 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--clay-surface-alt)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              加载历史分析结果
            </button>

            <div style={{ borderTop: '2px solid var(--clay-border)', margin: '0.25rem 0' }} />

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-3 py-2.5 rounded-2xl text-sm cursor-pointer transition-colors duration-150 flex items-center gap-2"
              style={{ color: 'var(--color-danger)' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--clay-surface-alt)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
