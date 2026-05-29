import { IconFood, IconTransport } from './Icons';

export default function DailyDetail({ data }) {
  if (!data) return null;
  const { food, transport, totalDays } = data;

  const items = [
    {
      Icon: IconFood, title: '餐饮美食', data: food,
      advice: food.avgPerDay > 1.5 ? '外卖频率偏高，建议每周至少 3 天自己做饭' : '外卖频率适中，保持即可',
      accent: food.avgPerDay > 1.5 ? 'coral' : 'green',
    },
    {
      Icon: IconTransport, title: '交通出行', data: transport,
      advice: transport.avgAmount > 30 ? '单次交通费用偏高，优先公交/地铁' : '交通支出合理，继续保持',
      accent: transport.avgAmount > 30 ? 'coral' : 'green',
    },
  ];

  const accentColors = {
    coral: { soft: 'rgba(232, 152, 138, 0.08)', border: 'rgba(232, 152, 138, 0.2)', text: 'var(--color-danger)' },
    green: { soft: 'rgba(140, 184, 150, 0.08)', border: 'rgba(140, 184, 150, 0.2)', text: 'var(--color-success)' },
  };

  return (
    <div className="clay-card">
      <h2 className="section-title">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        高频消费分析
      </h2>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>统计周期共 {totalDays} 个有消费的天数</p>

      <div className="space-y-4">
        {items.map((item) => {
          const ac = accentColors[item.accent];
          return (
            <div
              key={item.title}
              className="rounded-2xl p-4 transition-colors duration-200"
              style={{
                background: ac.soft,
                border: `2.5px solid ${ac.border}`,
                boxShadow: 'var(--shadow-clay-sm)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <item.Icon className="w-5 h-5" style={{ color: ac.text }} />
                <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['总笔数', item.data.count],
                  ['日均笔数', item.data.count > 0 ? item.data.avgPerDay.toFixed(1) : '0'],
                  ['笔均金额', `¥${Math.round(item.data.avgAmount).toLocaleString()}`],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="rounded-2xl py-2.5"
                    style={{
                      background: 'var(--clay-surface)',
                      border: '2px solid var(--clay-border)',
                      boxShadow: 'var(--shadow-clay-sm)',
                    }}
                  >
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3 font-medium" style={{ color: ac.text }}>{item.advice}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
