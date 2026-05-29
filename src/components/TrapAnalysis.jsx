import { useState } from 'react';
import { IconBulb, IconAlert, IconFood, IconChart, IconCreditCard, IconSearch } from './Icons';

const ICON_MAP = {
  food: IconFood,
  spike: IconChart,
  entertainment: IconAlert,
  search: IconSearch,
  credit: IconCreditCard,
  bulb: IconBulb,
};

const SEVERITY_STYLE = {
  high: { border: 'rgba(212, 114, 106, 0.25)', bg: 'rgba(212, 114, 106, 0.04)', dot: '#D4726A', badge: '重点关注' },
  medium: { border: 'rgba(212, 149, 107, 0.2)', bg: 'rgba(212, 149, 107, 0.03)', dot: '#D4956B', badge: '可优化' },
  low: { border: 'rgba(135, 167, 199, 0.15)', bg: 'transparent', dot: '#87A7C7', badge: '留意' },
};

export default function TrapAnalysis({ trapData }) {
  if (!trapData || trapData.traps.length === 0) return null;

  const { traps, totalAnnualWaste } = trapData;
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="clay-card">
      <h2 className="section-title">
        <IconAlert className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
        消费陷阱盘点
      </h2>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        扫描全部 {traps.reduce((s, t) => s + t.matchCount, traps.find((t) => t.id === 'micro-payments') ? 0 : 0)} 笔交易，
        命中 {traps.length} 类消费陷阱，
        预估每年可节省{' '}
        <span className="font-bold" style={{ color: 'var(--color-success)' }}>
          ¥{totalAnnualWaste.toLocaleString()}
        </span>
      </p>

      <div className="space-y-3">
        {traps.map((trap) => {
          const style = SEVERITY_STYLE[trap.severity];
          const IconComp = ICON_MAP[trap.icon] || IconBulb;
          const isOpen = expanded === trap.id;

          return (
            <div
              key={trap.id}
              className="rounded-2xl transition-all duration-200"
              style={{
                background: style.bg,
                border: `2.5px solid ${style.border}`,
                boxShadow: 'var(--shadow-clay-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : trap.id)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left cursor-pointer transition-colors duration-150"
                style={{ color: 'var(--text-primary)' }}
              >
                <IconComp className="w-5 h-5 shrink-0" style={{ color: style.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{trap.name}</span>
                    <span
                      className="text-[10px] text-white px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: style.dot }}
                    >
                      {style.badge}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {trap.matchCount > 0
                      ? `${trap.matchCount} 笔共 ¥${trap.matchTotal.toLocaleString()}`
                      : trap.description}
                    {' · '}预估年省 ¥{trap.annualWaste.toLocaleString()}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--text-muted)' }}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  className="px-4 pb-4 animate-fade-in-up"
                  style={{ borderTop: '1.5px solid var(--clay-border)' }}
                >
                  {/* Suggestion */}
                  <div
                    className="mt-3 rounded-xl p-3 text-xs"
                    style={{
                      background: 'var(--clay-surface-alt)',
                      border: '1.5px solid var(--clay-border)',
                    }}
                  >
                    <span className="font-medium" style={{ color: style.dot }}>
                      {trap.annualWaste > 0 ? '💰' : '💡'} {trap.suggestion}
                    </span>
                  </div>

                  {/* Matched transactions */}
                  {trap.matches.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                        命中交易明细（按金额排序）
                      </p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {trap.matches.slice(0, 20).map((tx, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="text-[10px] shrink-0 w-10" style={{ color: 'var(--text-muted)' }}>
                                {tx.time.substring(5, 10)}
                              </span>
                              <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                                {tx.product || tx.category}
                              </span>
                            </div>
                            <span className="font-mono font-bold ml-2 shrink-0" style={{ color: 'var(--text-primary)' }}>
                              ¥{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {trap.matches.length > 20 && (
                          <p className="text-[10px] text-center py-1" style={{ color: 'var(--text-muted)' }}>
                            ...还有 {trap.matches.length - 20} 笔
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
