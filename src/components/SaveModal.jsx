import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { BILL_TYPES } from '../constants/billTypes';
import { IconClose } from './Icons';

export default function SaveModal({ transactions, analysis, allRecordsSummary, csvFileName, onClose }) {
  const { user, saveUserResult } = useUser();
  const { billType } = useData();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const btLabel = BILL_TYPES.find((t) => t.id === billType)?.name || '未知';

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('请输入分析结果名称'); return; }
    setSaving(true);
    setError('');

    const result = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: trimmed,
      csvFileName: csvFileName || '未知文件',
      billType: billType || null,
      createdAt: new Date().toISOString(),
      transactionCount: transactions.length,
      totalExpense: Math.round(analysis.catBreakdown.grandTotal),
      transactions,
      analysis,
      allRecordsSummary,
    };

    saveUserResult(user, result);
    setSaving(false);
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="animate-modal-in w-full max-w-md mx-4"
        style={{
          background: 'var(--clay-surface)',
          border: '3px solid var(--clay-border-strong)',
          borderRadius: 'var(--radius-clay-lg)',
          boxShadow: 'var(--shadow-clay-xl)',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            {done ? '保存成功' : '保存分析结果'}
          </h3>
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

        {done ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-green-soft)',
                border: '2.5px solid rgba(140, 184, 150, 0.3)',
                boxShadow: 'var(--shadow-clay-sm)',
              }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--color-success)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              已保存 "{name.trim()}"
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              后续可通过用户名 "{user}" 登录并加载此结果
            </p>
            <button className="clay-btn mt-5" onClick={onClose}>完成</button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div
              className="rounded-2xl p-3 mb-4 text-xs space-y-1"
              style={{ background: 'var(--clay-surface-alt)', border: '2px solid var(--clay-border)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>账单类型</span>
                <span style={{ color: 'var(--text-primary)' }}>{btLabel}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>数据来源</span>
                <span style={{ color: 'var(--text-primary)' }}>{csvFileName || '未知文件'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>支出笔数</span>
                <span style={{ color: 'var(--text-primary)' }}>{transactions.length} 笔</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>总支出</span>
                <span className="font-bold" style={{ color: 'var(--accent-terracotta)' }}>
                  ¥{Math.round(analysis.catBreakdown.grandTotal).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Name input */}
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>分析结果名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="例：2025年度账单分析"
              autoFocus
              className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 mb-1"
              style={{
                background: 'var(--clay-surface)',
                border: '2.5px solid var(--clay-border)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                boxShadow: 'inset 2px 2px 6px rgba(180,160,140,0.12)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-terracotta)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--clay-border)'}
            />
            {error && <p className="text-xs mb-2" style={{ color: 'var(--color-danger)' }}>{error}</p>}

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button className="clay-btn flex-1" onClick={onClose}>取消</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-terracotta), #D4956B)',
                  border: '2.5px solid rgba(198, 123, 92, 0.4)',
                  boxShadow: 'var(--shadow-clay-md)',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
