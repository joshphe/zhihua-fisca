import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ESSENTIAL_COLORS } from '../constants/categories';
import { IconScale } from './Icons';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

function formatAmount(v) {
  if (v >= 10000) return `¥${(v / 10000).toFixed(1)}万`;
  return `¥${v.toLocaleString()}`;
}

const EC = {
  essential: '#8CB896',
  nonEssential: '#E8988A',
  debt: '#D4726A',
  other: '#C8B6A0',
  neutral: '#D4C8BC',
};

function StatCard({ label, amount, pct, color }) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{
        background: 'var(--clay-surface)',
        border: '2.5px solid var(--clay-border)',
        boxShadow: 'var(--shadow-clay-sm)',
      }}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{formatAmount(amount)}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pct}%</p>
    </div>
  );
}

export default function EssentialAnalysis({ data }) {
  const { totals, ratios, categorized } = data;

  const pieData = [
    { name: '必需', value: totals.essential, color: EC.essential },
    { name: '非必需', value: totals.nonEssential, color: EC.nonEssential },
    { name: '负债', value: totals.debt, color: EC.debt },
    { name: '其他', value: totals.other, color: EC.other },
  ].filter((d) => d.value > 0);

  const gaugeOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#D4C8BC',
      borderWidth: 2,
      borderRadius: 16,
      padding: [10, 14],
      textStyle: { color: '#2D2420', fontSize: 12, fontFamily: 'inherit' },
      formatter: (p) => `${p.name}<br/><b>${formatAmount(p.value)}</b> (${p.percent}%)`,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '76%'],
        center: ['25%', '50%'],
        data: pieData.map((d) => ({
          name: d.name, value: d.value,
          itemStyle: { color: d.color, borderRadius: 5, borderColor: '#fff', borderWidth: 3 },
        })),
        label: { show: false },
        emphasis: { scaleSize: 8, label: { show: true, fontSize: 13, fontWeight: 'bold' } },
      },
      {
        type: 'pie',
        radius: ['50%', '76%'],
        center: ['75%', '50%'],
        data: [
          { value: totals.nonEssential, name: '非必需', itemStyle: { color: EC.nonEssential, borderRadius: 5, borderColor: '#fff', borderWidth: 3 } },
          { value: totals.essential + totals.debt + totals.other, name: '其他', itemStyle: { color: EC.neutral, borderRadius: 5, borderColor: '#fff', borderWidth: 3 } },
        ],
        label: { show: false },
        emphasis: { scaleSize: 8, label: { show: true, fontSize: 13, fontWeight: 'bold' } },
      },
    ],
    graphic: [
      { type: 'text', left: '22%', top: '46%', style: { text: '分类构成', fill: '#8C8078', fontSize: 10, textAlign: 'center' } },
      { type: 'text', left: '72%', top: '46%', style: { text: '必需/非必需', fill: '#8C8078', fontSize: 10, textAlign: 'center' } },
    ],
  }), [totals, pieData]);

  const nonEssentialTop5 = useMemo(
    () => (categorized['non-essential'] || []).sort((a, b) => b.amount - a.amount).slice(0, 5),
    [categorized]
  );

  const stats = [
    { label: '必需开支', amount: totals.essential, pct: ratios.essential, color: EC.essential },
    { label: '非必需开支', amount: totals.nonEssential, pct: ratios.nonEssential, color: EC.nonEssential },
    { label: '负债/还款', amount: totals.debt, pct: ratios.debt, color: EC.debt },
    { label: '其他', amount: totals.other, pct: ratios.other, color: EC.other },
  ].filter((s) => s.amount > 0 || s.label === '其他');

  return (
    <div className="clay-card">
      <h2 className="section-title"><IconScale className="w-5 h-5" />必需 vs 非必需开支</h2>

      {/* Top: 4 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Middle: Double donut chart */}
      <ReactEChartsCore echarts={echarts} option={gaugeOption} style={{ height: 230 }} notMerge />

      {/* Bottom: progress bar + TOP 5 side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Progress + assessment */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'var(--clay-surface-alt)',
            border: '2.5px solid var(--clay-border)',
            boxShadow: 'var(--shadow-clay-sm)',
          }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>非必需支出占比评估</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{ratios.nonEssential}%</span>
            <span className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>占总支出</span>
          </div>
          <div className="w-full rounded-full h-3 mb-2" style={{
            background: 'var(--clay-surface)',
            border: '2px solid var(--clay-border)',
            boxShadow: 'inset 2px 2px 4px rgba(180,160,140,0.15)',
            padding: 1,
          }}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${Math.min(parseFloat(ratios.nonEssential), 100)}%`,
              background: 'linear-gradient(90deg, #D4956B, #D4726A)',
              boxShadow: 'inset -1px -1px 2px rgba(255,255,255,0.3)',
            }} />
          </div>
          <div className="flex justify-between text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {parseFloat(ratios.nonEssential) > 40
              ? '非必需占比偏高，建议严格控制可选消费支出。'
              : parseFloat(ratios.nonEssential) > 25
              ? '非必需占比适中，仍有优化空间。'
              : '非必需占比较低，财务结构健康。'}
            建议采用「50-30-20」法则：50% 必需、30% 享受、20% 储蓄。
          </p>
        </div>

        {/* TOP 5 */}
        <div>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>非必需支出 TOP 5</h3>
          {nonEssentialTop5.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: 'var(--text-muted)' }}>无非必需支出记录</p>
          ) : (
            <div className="space-y-1.5">
              {nonEssentialTop5.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{
                    background: i === 0 ? 'rgba(232, 152, 138, 0.08)' : 'transparent',
                    border: i === 0 ? '2px solid rgba(232, 152, 138, 0.15)' : '1.5px solid transparent',
                  }}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-[10px] font-bold shrink-0 w-4 text-center" style={{ color: 'var(--text-muted)' }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{tx.product || tx.category}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tx.time.substring(0, 10)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold ml-2 shrink-0" style={{ color: 'var(--color-danger)' }}>
                    ¥{tx.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
