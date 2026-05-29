import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { BILL_TYPES } from '../constants/billTypes';
import { IconClose, IconEmpty } from './Icons';

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function LoadModal({ onClose, onLoadResult }) {
  const { user, getUserResults, deleteUserResult } = useUser();
  const [results, setResults] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setResults(getUserResults(user));
  }, [user, getUserResults]);

  const handleDelete = (id) => {
    setDeleting(id);
    deleteUserResult(user, id);
    setResults((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="animate-modal-in w-full max-w-lg max-h-[80vh] mx-4 flex flex-col"
        style={{
          background: 'var(--clay-surface)',
          border: '3px solid var(--clay-border-strong)',
          borderRadius: 'var(--radius-clay-lg)',
          boxShadow: 'var(--shadow-clay-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '2.5px solid var(--clay-border)' }}
        >
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>历史分析结果</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              用户 "{user}" 共 {results.length} 条记录
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
            style={{ border: '2px solid var(--clay-border)', boxShadow: 'var(--shadow-clay-sm)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-pressed)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-sm)'; }}
            onClick={onClose}
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <IconEmpty className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>暂无保存的分析结果</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>完成账单分析后点击右上角菜单保存</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: 'var(--clay-surface-alt)',
                    border: '2.5px solid var(--clay-border)',
                    boxShadow: 'var(--shadow-clay-sm)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                      </h4>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(r.createdAt)} · {r.csvFileName}
                        {r.billType ? ` · ${BILL_TYPES.find((t) => t.id === r.billType)?.name || ''}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                    <span>{r.transactionCount} 笔支出</span>
                    <span className="font-bold" style={{ color: 'var(--accent-terracotta)' }}>
                      ¥{r.totalExpense.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { onClose(); onLoadResult(r); }}
                      className="flex-1 py-2 rounded-2xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-terracotta), #D4956B)',
                        border: '2.5px solid rgba(198, 123, 92, 0.4)',
                        boxShadow: 'var(--shadow-clay-sm)',
                      }}
                    >
                      加载此结果
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="py-2 px-3 rounded-2xl text-xs cursor-pointer transition-colors duration-200"
                      style={{
                        border: '2px solid rgba(212, 114, 106, 0.3)',
                        color: 'var(--color-danger)',
                        background: deleting === r.id ? 'rgba(212,114,106,0.1)' : 'transparent',
                      }}
                    >
                      {deleting === r.id ? '...' : '删除'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 text-center shrink-0"
          style={{
            borderTop: '2.5px solid var(--clay-border)',
            background: 'var(--clay-surface-alt)',
            borderBottomLeftRadius: 'var(--radius-clay-lg)',
            borderBottomRightRadius: 'var(--radius-clay-lg)',
          }}
        >
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>点击空白处关闭</p>
        </div>
      </div>
    </div>
  );
}
