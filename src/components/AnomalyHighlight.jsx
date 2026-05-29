import { IconAlert, IconEmpty } from './Icons';

export default function AnomalyHighlight({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="clay-card">
        <h2 className="section-title"><IconAlert className="w-5 h-5" />大额消费记录</h2>
        <div className="text-center py-10">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
            style={{ border: '2.5px solid var(--clay-border)', boxShadow: 'var(--shadow-clay-sm)' }}
          >
            <IconEmpty className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>无单笔超过 ¥5,000 的消费</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>财务状况良好</p>
        </div>
      </div>
    );
  }

  const totalAnomaly = anomalies.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="clay-card">
      <h2 className="section-title"><IconAlert className="w-5 h-5" />大额消费记录</h2>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        检测到 {anomalies.length} 笔单笔超 ¥5,000 的消费，合计{' '}
        <span className="font-bold" style={{ color: 'var(--color-danger)' }}>¥{totalAnomaly.toLocaleString()}</span>
      </p>

      <div className="space-y-3">
        {anomalies.map((tx, i) => {
          const isHuge = tx.amount >= 10000;
          return (
            <div
              key={i}
              className="rounded-2xl p-4 transition-colors duration-200"
              style={{
                background: isHuge ? 'rgba(212, 114, 106, 0.05)' : 'rgba(212, 149, 107, 0.05)',
                border: `2.5px solid ${isHuge ? 'rgba(212, 114, 106, 0.2)' : 'rgba(212, 149, 107, 0.2)'}`,
                boxShadow: 'var(--shadow-clay-sm)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{tx.product || tx.category}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{tx.time.substring(0, 10)} · {tx.category}</p>
                  {tx.counterparty && (
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{tx.counterparty}</p>
                  )}
                </div>
                <p
                  className="text-lg font-bold ml-3 shrink-0"
                  style={{ color: isHuge ? 'var(--color-danger)' : 'var(--color-warning)' }}
                >
                  ¥{tx.amount.toLocaleString()}
                </p>
              </div>
              {isHuge && (
                <div
                  className="mt-3 text-[10px] font-medium rounded-xl px-2.5 py-1 inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(212, 114, 106, 0.1)',
                    border: '2px solid rgba(212, 114, 106, 0.2)',
                    color: 'var(--color-danger)',
                  }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  超大额支出，请确认是否必要
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
