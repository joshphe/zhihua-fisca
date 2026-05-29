import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { IconChart } from './Icons';

echarts.use([BarChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

const C = {
  bar: '#C67B5C',
  barGradStart: '#D4956B',
  barGradEnd: '#E8C8B0',
  barHover: '#B56548',
  danger: '#D4726A',
  warning: '#D4956B',
  markLine: '#8C8078',
  gridLine: '#E8DDD4',
  text: '#5C4F48',
  tooltipBg: '#fff',
  tooltipBorder: '#D4C8BC',
};

export default function MonthlyTrend({ data }) {
  const { months, avgMonthly } = data;

  const chartOption = useMemo(() => {
    if (months.length === 0) return {};
    const labels = months.map((m) => m.month.substring(5));
    const amounts = months.map((m) => m.total);
    const avg = avgMonthly;

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: C.tooltipBg,
        borderColor: C.tooltipBorder,
        borderWidth: 2,
        borderRadius: 16,
        padding: [12, 16],
        textStyle: { color: '#2D2420', fontSize: 13, fontFamily: 'inherit' },
        extraCssText: 'box-shadow: 5px 5px 14px rgba(180,160,140,0.18), inset -3px -3px 6px rgba(255,255,255,0.9);',
        formatter: (params) => {
          const v = params[0].value;
          const pct = Math.round((v / avg - 1) * 100);
          const sign = v > avg ? '+' : '';
          return `<div style="font-size:11px;color:#8C8078;margin-bottom:4px">${params[0].name}月</div>
            <div style="font-size:20px;font-weight:700;color:#2D2420">¥${v.toLocaleString()}</div>
            <div style="font-size:12px;color:${v > avg ? '#D4726A' : '#6DAF7E'};margin-top:2px">
              较月均 ${sign}${pct}%
            </div>`;
        },
      },
      grid: { top: 30, right: 16, bottom: 24, left: 52 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 11, color: C.text, formatter: '{value}月' },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: C.gridLine } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11, color: C.text,
          formatter: (v) => (v >= 10000 ? `${(v / 10000).toFixed(1)}万` : v),
        },
        splitLine: { lineStyle: { color: C.gridLine, type: 'dashed' } },
      },
      series: [{
        type: 'bar',
        data: amounts.map((v) => ({
          value: v,
          itemStyle: {
            color: v > avg * 3 ? C.danger : v > avg * 1.5 ? C.warning
              : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: C.barGradStart },
                  { offset: 1, color: C.barGradEnd },
                ]),
            borderRadius: [10, 10, 0, 0],
          },
        })),
        barMaxWidth: 42,
        emphasis: { itemStyle: { color: C.barHover } },
        markLine: {
          silent: true, symbol: 'none',
          data: [{
            yAxis: avg,
            label: { formatter: `月均 ¥${Math.round(avg).toLocaleString()}`, fontSize: 11, color: C.markLine },
            lineStyle: { color: C.markLine, type: 'dashed', width: 1.5 },
          }],
        },
      }],
    };
  }, [months, avgMonthly]);

  if (months.length === 0) {
    return (
      <div className="clay-card">
        <h2 className="section-title"><IconChart className="w-5 h-5" />月度支出趋势</h2>
        <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>暂无月度数据</p>
      </div>
    );
  }

  return (
    <div className="clay-card">
      <h2 className="section-title"><IconChart className="w-5 h-5" />月度支出趋势</h2>
      <ReactEChartsCore echarts={echarts} option={chartOption} style={{ height: 300 }} notMerge />
      <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--color-danger)' }}>● 异常月份（月均 3 倍以上）</span>
        <span style={{ color: 'var(--color-warning)' }}>● 偏高月份（1.5 倍以上）</span>
      </div>
    </div>
  );
}
