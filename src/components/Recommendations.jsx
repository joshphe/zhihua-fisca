import { IconSparkles, IconFood, IconChart, IconBulb, IconCreditCard, IconSearch, IconTarget } from './Icons';

const ICON_MAP = {
  entertainment: IconSparkles, food: IconFood, spike: IconChart,
  bulb: IconBulb, credit: IconCreditCard, search: IconSearch, target: IconTarget,
};

const LEVEL_STYLES = {
  danger: { border: 'rgba(212, 114, 106, 0.25)', bg: 'rgba(212, 114, 106, 0.04)', badge: '#D4726A', title: '#B05850' },
  warning: { border: 'rgba(212, 149, 107, 0.25)', bg: 'rgba(212, 149, 107, 0.04)', badge: '#D4956B', title: '#B07048' },
  info: { border: 'rgba(135, 167, 199, 0.25)', bg: 'rgba(135, 167, 199, 0.04)', badge: '#87A7C7', title: '#6B8AA8' },
};

const LEVEL_LABELS = { danger: '重点关注', warning: '建议优化', info: '温馨提示' };

export default function Recommendations({ recs }) {
  if (!recs || recs.length === 0) return null;

  return (
    <div className="clay-card">
      <h2 className="section-title"><IconBulb className="w-5 h-5" />优化建议与行动指南</h2>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        基于一年消费数据生成的个性化财务优化建议
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {recs.map((rec, i) => {
          const styles = LEVEL_STYLES[rec.level] || LEVEL_STYLES.info;
          const IconComp = ICON_MAP[rec.icon] || IconBulb;
          return (
            <div
              key={i}
              className="rounded-2xl p-5 transition-colors duration-200 cursor-pointer"
              style={{
                background: styles.bg,
                border: `2.5px solid ${styles.border}`,
                boxShadow: 'var(--shadow-clay-sm)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-sm)'; }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'var(--clay-surface)',
                    border: `2px solid ${styles.border}`,
                    boxShadow: 'var(--shadow-clay-sm)',
                    color: styles.title,
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-semibold text-sm" style={{ color: styles.title }}>{rec.title}</h3>
                  <span
                    className="text-[10px] text-white px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ background: styles.badge, boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.15)' }}
                  >
                    {LEVEL_LABELS[rec.level]}
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rec.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
