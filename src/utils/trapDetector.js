import { TRAP_CATEGORIES } from './spendingTraps';

/**
 * 扫描全部支出交易，返回陷阱分析结果
 */
export function detectTraps(transactions) {
  if (!transactions || transactions.length === 0) return { traps: [], totalAnnualWaste: 0 };

  const results = [];

  TRAP_CATEGORIES.forEach((trap) => {
    // 逐笔检测
    const matches = trap.id === 'micro-payments'
      ? [] // micro-payment uses aggregate analysis
      : transactions.filter((tx) => trap.detect(tx));

    // 豁免：命中数为 0 的陷阱不展示（micro-payment 除外，它用聚合分析）
    if (trap.id !== 'micro-payments' && matches.length === 0) return;

    const { annualWaste, suggestion, severity } = trap.estimate(matches, transactions);

    // 豁免：无浪费或低严重度且无命中的不展示
    if (annualWaste === 0 && severity === 'low' && matches.length === 0) return;

    results.push({
      id: trap.id,
      name: trap.name,
      icon: trap.icon,
      description: trap.description,
      matches: matches.sort((a, b) => b.amount - a.amount),
      matchCount: matches.length,
      matchTotal: matches.reduce((s, t) => s + t.amount, 0),
      annualWaste,
      suggestion,
      severity,
    });
  });

  // 按年浪费金额排序
  results.sort((a, b) => b.annualWaste - a.annualWaste);

  const totalAnnualWaste = results.reduce((s, r) => s + r.annualWaste, 0);

  return { traps: results, totalAnnualWaste };
}
