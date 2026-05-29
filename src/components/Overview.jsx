import useCountUp from '../utils/useCountUp';

const cardAccentMap = {
  terracotta: { bg: 'var(--accent-terracotta-soft)', border: 'rgba(198, 123, 92, 0.3)', text: 'var(--accent-terracotta)' },
  blue: { bg: 'var(--accent-blue-soft)', border: 'rgba(135, 167, 199, 0.3)', text: 'var(--accent-blue)' },
  green: { bg: 'var(--accent-green-soft)', border: 'rgba(140, 184, 150, 0.3)', text: 'var(--color-success)' },
  coral: { bg: 'var(--accent-coral-soft)', border: 'rgba(232, 152, 138, 0.3)', text: 'var(--color-danger)' },
};

function OverviewCard({ label, formattedValue, sub, accent, icon }) {
  const accentStyle = cardAccentMap[accent] || {};
  return (
    <div className="clay-card clay-card-interactive text-center py-5 px-3">
      {icon && (
        <div className="flex justify-center mb-2" style={{ color: 'var(--text-muted)' }}>
          {icon}
        </div>
      )}
      <p className="text-[11px] font-medium mb-2 tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="text-xl font-bold font-mono tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {formattedValue}
      </p>
      {sub && (
        <span
          className="inline-block text-[10px] mt-2 px-2.5 py-0.5 rounded-full font-medium"
          style={{
            color: accentStyle.text || 'var(--text-muted)',
            background: accentStyle.bg || 'var(--clay-surface-alt)',
            border: `2px solid ${accentStyle.border || 'var(--clay-border)'}`,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

export default function Overview({ analysis, allRecordsSummary }) {
  const { trend, catBreakdown } = analysis;

  const totalExpense = Math.round(catBreakdown.grandTotal);
  const avgMonthly = Math.round(trend.avgMonthly);
  const avgDaily = trend.months.length > 0 ? Math.round(totalExpense / (trend.months.length * 30)) : 0;
  const totalCount = catBreakdown.categories.reduce((s, c) => s + c.count, 0);
  const topCategory = catBreakdown.categories[0];

  const neutralTotal = allRecordsSummary
    ? allRecordsSummary.neutral.reduce((s, r) => s + r.amount, 0)
    : 0;

  const animatedExpense = useCountUp(totalExpense, 1000);
  const animatedMonthly = useCountUp(avgMonthly, 800);
  const animatedDaily = useCountUp(avgDaily, 600);
  const animatedCount = useCountUp(totalCount, 600);
  const animatedNeutral = useCountUp(Math.round(neutralTotal), 700);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
      <OverviewCard
        label="总支出"
        formattedValue={`¥${animatedExpense.toLocaleString()}`}
      />
      <OverviewCard
        label="月均支出"
        formattedValue={`¥${animatedMonthly.toLocaleString()}`}
        sub={avgMonthly > 8000 ? '偏高' : '正常'}
        accent={avgMonthly > 8000 ? 'coral' : 'green'}
      />
      <OverviewCard
        label="日均支出"
        formattedValue={`¥${animatedDaily.toLocaleString()}`}
        accent={avgDaily > 300 ? 'coral' : 'green'}
      />
      <OverviewCard
        label="支出笔数"
        formattedValue={`${animatedCount.toLocaleString()} 笔`}
      />
      <OverviewCard
        label="最大类别"
        formattedValue={topCategory?.name || '-'}
        sub={topCategory ? `¥${topCategory.total.toLocaleString()}` : ''}
        accent="terracotta"
      />
      <OverviewCard
        label="信用卡还款"
        formattedValue={`¥${animatedNeutral.toLocaleString()}`}
        accent={neutralTotal > 50000 ? 'coral' : undefined}
      />
    </div>
  );
}
