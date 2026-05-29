import { useCallback, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { IconUpload, IconCheck, IconFolder } from './Icons';
import { BILL_TYPES } from '../constants/billTypes';

export default function FileUpload({ onFile }) {
  const { loadFile, transactions, loading } = useData();
  const [dragOver, setDragOver] = useState(false);
  const [billType, setBillType] = useState('alipay');
  const inputRef = useRef(null);

  const currentType = BILL_TYPES.find((t) => t.id === billType) || BILL_TYPES[0];

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      onFile?.(file);
      loadFile(file, billType);
    },
    [loadFile, onFile, billType]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const hasData = transactions.length > 0;

  return (
    <div
      className={`clay-card clay-card-interactive transition-all duration-300 ${
        hasData ? 'p-4' : 'p-8'
      }`}
      style={dragOver ? {
        borderColor: 'var(--accent-terracotta)',
        boxShadow: 'var(--shadow-clay-lg)',
        background: 'var(--clay-surface-alt)',
        transform: 'scale(1.005)',
      } : {}}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => !hasData && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={currentType.extension}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleFile(file);
        }}
      />

      {/* Bill type selector — always visible */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {BILL_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={(e) => {
              e.stopPropagation();
              setBillType(t.id);
              if (inputRef.current) inputRef.current.value = '';
            }}
            disabled={loading}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200 ${
              billType === t.id ? 'clay-btn-active' : 'clay-btn'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {hasData ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-green-soft)',
                border: '2.5px solid rgba(140, 184, 150, 0.3)',
                boxShadow: 'var(--shadow-clay-sm)',
                color: 'var(--color-success)',
              }}
            >
              <IconCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                已解析 {transactions.length} 笔支出
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                数据就绪，可点击更换文件
              </p>
            </div>
          </div>
          <button
            className="clay-btn text-xs"
            style={{
              background: 'var(--accent-terracotta-soft)',
              borderColor: 'rgba(198, 123, 92, 0.3)',
              color: 'var(--accent-terracotta)',
            }}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            更换文件
          </button>
        </div>
      ) : (
        <div className="text-center">
          {/* Upload icon */}
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{
              background: dragOver ? 'var(--accent-terracotta-soft)' : 'var(--clay-surface-alt)',
              border: `2.5px solid ${dragOver ? 'rgba(198, 123, 92, 0.3)' : 'var(--clay-border)'}`,
              boxShadow: dragOver ? 'var(--shadow-clay-md)' : 'var(--shadow-clay-sm)',
              color: dragOver ? 'var(--accent-terracotta)' : 'var(--text-muted)',
              transform: dragOver ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {dragOver ? <IconUpload className="w-8 h-8" /> : <IconFolder className="w-8 h-8" />}
          </div>

          <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            {dragOver ? '松开上传文件' : loading ? '解析中...' : `上传${currentType.name}账单`}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            拖拽文件到此处，或点击选择文件
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="clay-tag">{currentType.extension}</span>
            <span className="clay-tag">{currentType.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
