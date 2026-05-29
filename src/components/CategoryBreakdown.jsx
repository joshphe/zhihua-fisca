import { useMemo, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CATEGORY_MAP } from '../constants/categories';
import { useData } from '../context/DataContext';
import { IconPieChart, IconClose } from './Icons';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

function formatAmount(v) {
  if (v >= 10000) return `¥${(v / 10000).toFixed(1)}万`;
  return `¥${v.toLocaleString()}`;
}

// Warm clay-compatible palette for the pie
const PIE_COLORS = [
  '#C67B5C', '#D4956B', '#87A7C7', '#8CB896', '#E8988A',
  '#B8A088', '#9DB4C8', '#A8C8A8', '#C8A898', '#D4C8BC',
];

export default function CategoryBreakdown({ data }) {
  const { transactions } = useData();
  const [sortBy, setSortBy] = useState('total');
  const [modalCat, setModalCat] = useState(null);

  const chartOption = useMemo(() => {
    const top8 = data.categories.slice(0, 8);
    const othersTotal = data.categories.slice(8).reduce((s, c) => s + c.total, 0);

    const pieData = top8.map((c, i) => ({
      name: c.name,
      value: c.total,
      itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
    }));
    if (othersTotal > 0) pieData.push({ name: '其他', value: othersTotal, itemStyle: { color: '#D4C8BC' } });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#D4C8BC',
        borderWidth: 2,
        borderRadius: 16,
        padding: [10, 14],
        textStyle: { color: '#2D2420', fontSize: 12, fontFamily: 'inherit' },
        extraCssText: 'box-shadow: 5px 5px 14px rgba(180,160,140,0.18);',
        formatter: (p) => `<b>${p.name}</b><br/>${formatAmount(p.value)} <span style="color:#8C8078">(${p.percent}%)</span>`,
      },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '55%'],
        data: pieData,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
        label: { formatter: '{b}\n{d}%', fontSize: 11, color: '#5C4F48' },
        emphasis: { scaleSize: 8, label: { fontSize: 14, fontWeight: 'bold' } },
      }],
    };
  }, [data]);

  const sortedList = useMemo(() => {
    const list = [...data.categories];
    if (sortBy === 'total') list.sort((a, b) => b.total - a.total);
    else if (sortBy === 'count') list.sort((a, b) => b.count - a.count);
    else if (sortBy === 'avg') list.sort((a, b) => b.avg - a.avg);
    return list;
  }, [data, sortBy]);

  const modalEntries = useMemo(() => {
    if (!modalCat) return [];
    return transactions.filter((tx) => tx.category === modalCat).sort((a, b) => b.amount - a.amount);
  }, [modalCat, transactions]);

  const catIdx = modalCat ? data.categories.findIndex((c) => c.name === modalCat) : -1;

  return (
    <div className="clay-card">
      <h2 className="section-title"><IconPieChart className="w-5 h-5" />支出构成</h2>
      <ReactEChartsCore echarts={echarts} option={chartOption} style={{ height: 300 }} notMerge />

      <div className="flex gap-2 mt-3 mb-2">
        {['金额', '笔数', '笔均'].map((label) => {
          const key = label === '金额' ? 'total' : label === '笔数' ? 'count' : 'avg';
          return (
            <button
              key={key}
              className={sortBy === key ? 'clay-btn clay-btn-active' : 'clay-btn'}
              onClick={() => setSortBy(key)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: 'var(--text-muted)', borderBottom: '2px solid var(--clay-border)' }}>
              <th className="text-left py-2 font-medium">类别</th>
              <th className="text-right py-2 font-medium">金额</th>
              <th className="text-right py-2 font-medium">笔数</th>
              <th className="text-right py-2 font-medium">占比</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((c, i) => (
              <tr
                key={c.name}
                className="cursor-pointer text-xs transition-colors duration-150"
                style={{ borderBottom: '1.5px solid var(--clay-border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-surface-alt)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => setModalCat(c.name)}
              >
                <td className="py-2" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {c.name}
                </td>
                <td className="text-right py-2 font-mono" style={{ color: 'var(--text-primary)' }}>{formatAmount(c.total)}</td>
                <td className="text-right py-2" style={{ color: 'var(--text-muted)' }}>{c.count}</td>
                <td className="text-right py-2" style={{ color: 'var(--text-muted)' }}>{c.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
          onClick={() => setModalCat(null)}
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
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '2.5px solid var(--clay-border)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ border: '2.5px solid var(--clay-border)', boxShadow: 'var(--shadow-clay-sm)' }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: catIdx >= 0 ? PIE_COLORS[catIdx % PIE_COLORS.length] : '#D4C8BC' }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{modalCat}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {modalEntries.length} 笔 · {formatAmount(modalEntries.reduce((s, t) => s + t.amount, 0))}
                  </p>
                </div>
              </div>
              <button
                className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  background: 'var(--clay-surface)',
                  border: '2.5px solid var(--clay-border)',
                  boxShadow: 'var(--shadow-clay-sm)',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-pressed)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-clay-sm)'; }}
                onClick={() => setModalCat(null)}
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-3">
              {modalEntries.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无记录</p>
              ) : (
                <div className="space-y-1">
                  {modalEntries.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors duration-150"
                      style={{ borderBottom: i < modalEntries.length - 1 ? '1.5px solid var(--clay-border)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clay-surface-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{tx.product || tx.category}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {tx.time.substring(0, 10)}
                          {tx.counterparty ? ` · ${tx.counterparty}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-mono font-bold shrink-0" style={{ color: 'var(--text-primary)' }}>
                        ¥{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="px-6 py-3 text-center"
              style={{
                borderTop: '2.5px solid var(--clay-border)',
                background: 'var(--clay-surface-alt)',
                borderBottomLeftRadius: 'var(--radius-clay-lg)',
                borderBottomRightRadius: 'var(--radius-clay-lg)',
              }}
            >
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                点击空白处关闭 · 共 {modalEntries.length} 条记录
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
